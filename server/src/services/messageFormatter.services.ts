// services/messageFormatter.service.ts

const Users = require("../models/Users.model");

const { decryptMessage } =
    require("../utils/chatEncryption");

const { getSignedMediaUrl } =
    require("../utils/gcsServices");

const { chatBucket } =
    require("../config/gcs");



interface FormatOptions {
    decryptedChatKey: string;
    currentUserId: string | null;
}



export const formatMessage = async (
    message: any,
    options: FormatOptions
) => {

    const formattedMessage = {
        ...message
    };

    formattedMessage._id = formattedMessage._id.toString();
    formattedMessage.chat = formattedMessage.chat.toString();
    // decrypt text
    if (
        formattedMessage.encryptedMessage &&
        formattedMessage.iv &&
        formattedMessage.authTag
    ) {

        formattedMessage.encryptedMessage =
            decryptMessage(
                formattedMessage.encryptedMessage,
                formattedMessage.iv,
                formattedMessage.authTag,
                options.decryptedChatKey
            );

    } else {

        formattedMessage.encryptedMessage = "";
    }



    // media url
    if (
        formattedMessage.media?.public_id &&
        (
            formattedMessage.contentType === "image" ||
            formattedMessage.contentType === "video"
        )
    ) {

        const mediaUrl =
            await getSignedMediaUrl(
                formattedMessage.media.public_id,
                chatBucket,
                formattedMessage.contentType
            );
        formattedMessage.media = {
            url: mediaUrl,
            public_id: "",
            type: formattedMessage.contentType
        }

    } else {

        formattedMessage.media = null;
    }



    // sender id
    const senderId =
        formattedMessage?.sender?._id ||
        formattedMessage?.sender;



    // sender check
    formattedMessage.isSend =
        senderId?.toString() ===
        options.currentUserId;



    // sender info
    const senderInfo =
        await Users.findById(senderId)
            .select(
                "_id username profileImg firstname lastname"
            )
            .lean();



    formattedMessage.sender = senderInfo;



    // remove sensitive fields
    delete formattedMessage.iv;
    delete formattedMessage.authTag;



    return formattedMessage;
};