const Users = require('../models/Users.model');
const Chats = require('../models/Chats.model');
const Messages = require('../models/Messages.model');

import { Request, Response, NextFunction } from "express";
import messageDeleter from "../services/deleteMessage.services";

import AppError from "../utils/AppError";

import { Chats as Chat } from '../interfaces/chat.interface';
import Message from '../interfaces/message.interface';
const { sendNotification } = require('../services/notification.services');

const crypto = require("crypto");

const {
    encryptChatKey,
    decryptChatKey,
    encryptMessage,
    decryptMessage
} = require("../utils/chatEncryption");

import {
    EncryptedChatKey,
    EncryptedMessage
} from '../utils/chatEncryption';

const {
    uploadToGCS,
    deleteFromGCSSecure,
    getSignedMediaUrl
} = require("../utils/gcsServices");

const { chatBucket } = require("../config/gcs");

const messageSocket = require('../socket/messageSocket');

import {
    formatMessage
} from "../services/messageFormatter.services";



// Send a message to a user
const sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    let uploadedMedia: any = null;

    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }
        let chat: Chat | null = req.chat;

        let type: "text" | "image" | "video" = "text";

        const media = req?.file;

        const receiverId = req.body?.receiverId as string;

        if (!receiverId && !chat) {
            return next(
                new AppError(
                    "Reciever Id is required for messaging",
                    400
                )
            );
        }

        const text = req.body?.text as string;

        let decryptedChatKey: string;


        // create/find chat
        if (!chat) {

            const chatExist: Chat | null =
                await Chats.findOne({
                    participants: {
                        $all: [req.user?.id, receiverId]
                    }
                }).lean();

            if (chatExist) {

                chat = chatExist;

                decryptedChatKey =
                    decryptChatKey(
                        chat.encryptedChatKey,
                        chat.keyIV
                    );

            } else {

                const chatKey =
                    crypto.randomBytes(32).toString("hex");

                const encryptedChatKey: EncryptedChatKey =
                    encryptChatKey(chatKey);

                chat = await Chats.create({
                    participants: [
                        req.user?.id,
                        receiverId
                    ],
                    encryptedChatKey:
                        encryptedChatKey.encryptedKey,
                    keyIV:
                        encryptedChatKey.iv
                });

                decryptedChatKey = chatKey;
            }

        } else {

            decryptedChatKey =
                decryptChatKey(
                    chat.encryptedChatKey,
                    chat.keyIV
                );
        }



        // media upload
        if (media) {

            if (media.mimetype.startsWith("image/")) {

                uploadedMedia =
                    await uploadToGCS(
                        media,
                        "chat_imgs",
                        `chat-${chat?._id}-${Date.now()}`,
                        {
                            width: 1080,
                            height: 1080
                        },
                        "image",
                        chatBucket
                    );

                type = "image";

            } else if (
                media.mimetype.startsWith("video/")
            ) {

                uploadedMedia =
                    await uploadToGCS(
                        media,
                        "chat_videos",
                        `chat-${chat?._id}-${Date.now()}`,
                        null,
                        "video",
                        chatBucket
                    );

                type = "video";
            }
        }



        // encrypt message
        let encryptedMessage: EncryptedMessage | null = null;

        if (text) {

            encryptedMessage =
                encryptMessage(
                    text,
                    decryptedChatKey
                );
        }



        // create message
        const createdMessage =
            await Messages.create({
                chat: chat?._id,
                sender: req.user?.id,
                contentType: type,

                encryptedMessage:
                    encryptedMessage
                        ? encryptedMessage.encryptedMessageText
                        : "",

                iv:
                    encryptedMessage
                        ? encryptedMessage.iv
                        : "",

                authTag:
                    encryptedMessage
                        ? encryptedMessage.authTag
                        : "",

                media: uploadedMedia
                    ? {
                        public_id:
                            uploadedMedia.public_id,
                        type:
                            uploadedMedia.type
                    }
                    : null
            });



        // update latest message
        await Chats.updateOne(
            {
                _id: chat?._id
            },
            {
                $set: {
                    latestMessage:
                        createdMessage._id.toString()
                }
            }
        );



        // receiver
        let receiver = null;

        if (chat) {

            receiver =
                chat.participants.find(
                    (participant: any) =>
                        participant.toString() !==
                        req.user?.id
                );
        }



        // participants
        const participantsData =
            await Users.find({
                _id: {
                    $in: chat?.participants
                }
            })
                .select(
                    "_id profileImg firstname lastname username"
                )
                .lean();



        // sender
        const senderData =
            await Users.findById(req?.user.id)
                .select(
                    "username _id profileImg username firstname lastname isOnline"
                )
                .lean();



        // format socket message
        const formattedMessage =
            await formatMessage(
                {
                    ...createdMessage.toObject(),
                    sender: {
                        _id: req.user?.id
                    }
                },
                {
                    decryptedChatKey,
                    currentUserId: receiver || receiverId
                }
            );



        // socket emit
        messageSocket(
            [receiver?.toString()],
            {
                sender: {
                    profileImg:
                        senderData?.profileImg || null,

                    username:
                        senderData?.username,

                    firstname:
                        senderData?.firstname,

                    lastname:
                        senderData?.lastname || "",
                },

                chat: {
                    chatId: chat?._id.toString(),
                    participants: [{
                        profileImg: senderData?.profileImg || null,
                        username:
                            senderData?.username,
                        firstname:
                            senderData?.firstname,
                        lastname:
                            senderData?.lastname || "",
                        _id: senderData?._id,
                        isOnline: senderData?.isOnline
                    }]
                },

                message: formattedMessage
            }
        );

        const userData = await Users.findById(user).select("username").lean();

        let previewText = "";

        if (type === "text" && text) {
            previewText =
                text.length > 80
                    ? `${text.substring(0, 80)}...`
                    : text;
        } else if (type === "image") {
            previewText = "image";
        } else if (type === "video") {
            previewText = "video";
        }
        await sendNotification({
            receiver: [req.receiverId || receiverId],
            sender: user,
            type: "message",
            link: "/chat",
            image: userData?.profileImg,
            mainMessage:
                `${userData?.username} send you a message`,
            notMessage: previewText
        });



        return res.status(201).json({
            message: "Message send successfully",
            chatId: chat?._id,
            chat: {
                chatId: chat?._id.toString(),
                participants: [{
                    profileImg: senderData?.profileImg || null,
                    username:
                        senderData?.username,
                    firstname:
                        senderData?.firstname,
                    lastname:
                        senderData?.lastname || "",
                    _id: senderData?._id,
                    isOnline: senderData?.isOnline
                }]
            },

            sendMessage: { ...formattedMessage, isSend: true }
        });

    } catch (err) {

        if (uploadedMedia) {

            await deleteFromGCSSecure(
                uploadedMedia.public_id,
                uploadedMedia.type
            );
        }

        console.error(err);

        return next(
            new AppError(
                "Internal Server Error",
                500
            )
        );
    }
};

// get a chat by user id
const getChat = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { chatId } = req.params;

        if (!chatId) {
            return next(new AppError("Chat id is not provided", 400));
        }

        const chat =
            await Chats.findOne({
                _id: chatId,
                participants: user
            })
                .populate({
                    path: "participants",
                    match: {
                        _id: { $ne: user }
                    },
                    select:
                        "lastname isOnline username profileImg firstname channel allowChats"
                })
                .select("participants latestMessage _id")
                .lean();

        if (!chat) {
            return next(new AppError("Chat not found", 404));
        }

        return res.status(200).json({
            message: "Chat data fetched successfully",
            chat
        });
    } catch (err) {
        return next(new AppError("Internal Server Error", 500));
    }
}



// Get all chats
const getUserChats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const LIMIT: number =
        Number(req.query?.limit || 10);

    const SKIP: number =
        Number(req.query?.skip || 0);

    try {

        const user = req.user?.id;

        if (!user) {
            return next(
                new AppError("Unauthroized", 401)
            );
        }

        const chats =
            await Chats.find({
                participants: user
            })
                .populate({
                    path: "participants",
                    match: {
                        _id: { $ne: user }
                    },
                    select:
                        "lastname isOnline username profileImg firstname channel allowChats"
                })
                .select("participants latestMessage _id")
                .sort({ updatedAt: -1 })
                .limit(LIMIT)
                .skip(SKIP)
                .lean();

        const totalChats =
            await Chats.countDocuments({
                participants: user
            });

        return res.status(200).json({
            message:
                "Chats fetched successfully",

            chats,

            nextSkip:
                SKIP + LIMIT,

            noMore:
                SKIP + LIMIT >= totalChats
        });

    } catch (err) {

        return next(
            new AppError(
                "Internal Server Error",
                500
            )
        );
    }
};




// Get all messages of a chat
const getChatMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const LIMIT: number =
        Number(req.query?.limit || 10);

    const SKIP: number =
        Number(req.query?.skip || 0);

    try {

        const user = req.user?.id;

        if (!user) {
            return next(
                new AppError(
                    "Unauthroized",
                    401
                )
            );
        }

        const chat: Chat | null = req.chat;

        if (!chat) {
            return next(
                new AppError(
                    "Chat not found",
                    404
                )
            );
        }



        // fetch messages
        const messages =
            await Messages.find({
                chat: chat._id
            })
                .sort({ createdAt: -1 })
                .populate(
                    "sender",
                    "_id username firstname lastname profileImg"
                )
                .limit(LIMIT)
                .skip(SKIP)
                .lean();

        const orderedMessages =
            messages.reverse();
        // decrypt chat key
        const decryptedChatKey: string =
            decryptChatKey(
                chat.encryptedChatKey,
                chat.keyIV
            );



        // decrypt + media formatting
        const updatedMessages =
            await Promise.all(

                orderedMessages.map(
                    async (message: Message) => {

                        // decrypt text
                        if (
                            message.encryptedMessage &&
                            message.iv &&
                            message.authTag
                        ) {

                            const decryptedMessageText =
                                decryptMessage(
                                    message.encryptedMessage,
                                    message.iv,
                                    message.authTag,
                                    decryptedChatKey
                                );

                            message.encryptedMessage =
                                decryptedMessageText;

                        } else {

                            message.encryptedMessage = "";
                        }



                        // media url
                        if (
                            message.contentType === "image" ||
                            message.contentType === "video"
                        ) {

                            const url =
                                await getSignedMediaUrl(
                                    message?.media?.public_id,
                                    chatBucket,
                                    message?.contentType
                                );

                            message.media = {
                                public_id: "",
                                url,
                                type: message?.contentType
                            }

                        } else {

                            message.media = null;
                        }



                        // sender flag
                        message.isSend =
                            message.sender._id.toString() ===
                            user;



                        return message;
                    }
                )
            );

        const cleanedMessages = updatedMessages.map((message: any) => {
            const { authTag, iv, ...rest } = message;

            return rest;
        });

        const totalMessages =
            await Messages.countDocuments({
                chat: chat._id
            });



        return res.status(200).json({

            message:
                "Messages fetched successfully",

            messages:
                cleanedMessages,

            nextSkip:
                SKIP + LIMIT,

            noMore:
                SKIP + LIMIT >= totalMessages
        });

    } catch (err) {

        console.error(err);

        return next(
            new AppError(
                "Internal Server Error",
                500
            )
        );
    }
};

// delete a single message from a chat
const deleteAMessage = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const chat = req.chat;
        if (!chat) {
            return next(new AppError("Chat is not available", 400));
        }

        const messageId = req.params?.messageId as string;

        if (!messageId) {
            return next(new AppError("message Id is required", 400));
        }

        await messageDeleter(messageId, chat?._id);

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error(err);
        return next(new AppError("Internal server error", 500));
    }
}

// delete the full chat
const deleteChat = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const chat = req?.chat;

        if (!chat) {
            return next(new AppError("Chat is required", 400));
        }

        await messageDeleter(null, chat?._id);

        await Chats.deleteOne({
            _id: chat?._id,
            participants: req.user?.id
        });

        return res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        return next(new AppError("Internal server error", 500));
    }
}



module.exports = {
    sendMessage,
    getUserChats,
    getChatMessages,
    deleteAMessage,
    deleteChat,
    getChat
};