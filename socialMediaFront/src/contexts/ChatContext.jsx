import { useState, useEffect, createContext, useContext } from "react";
import socket from "../socket/socket";
import {
    sendMessage,
    getChatMessages,
    getUserChats
} from "../api/chatApi";

import { useAuth } from "./AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const navigate = useNavigate();
    const { userData } = useAuth();
    const [receiverId, setReceiverId] = useState(null);
    const [mobileDevice, setMobileDevice] = useState(false);
    const [receiverInfo, setReceiverInfo] = useState({});
    const [currentChat, setCurrentChat] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setMobileDevice(window.innerWidth <= 768);
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Change current chat
    const handleCurrentChat = (chatInfo) => {

        if (!chatInfo) return;

        setCurrentChat(chatInfo.chatId);

        setReceiverInfo({
            firstname: chatInfo.firstname,
            lastname: chatInfo.lastname,
            username: chatInfo.username,
            profileImg: chatInfo.profileImg,
            channelId: chatInfo.channelId
        });

        setReceiverId(chatInfo.Id);

        // Use chatInfo.chatId directly
        // because state updates are async
        navigate(`/chats/${chatInfo.chatId}`);
    };


    const handleChat = (channelData) => {


        setReceiverId(channelData?.user);
        setReceiverInfo({
            channelId: channelData?._id,
            username: channelData?.name?.username,
            firstname: channelData?.name?.firstname,
            lastname: channelData?.name?.lastname || "",
            profileImg: channelData?.profileImg,
            onlineStatus: channelData?.isOnline,
            allowChats: channelData?.allowChats
        });
        setCurrentChat(null);
        navigate("/chats");
    }

    // Send message
    const sendAMessage = async (text, media = null) => {

        try {

            let data;

            // Existing chat
            if (currentChat) {

                data = await sendMessage(
                    text,
                    media,
                    null,
                    currentChat
                );

                return data;
            }

            // New chat
            data = await sendMessage(
                text,
                media,
                receiverId,
                null
            );

            // Set newly created chat
            setCurrentChat(data.chatId);

            // Navigate using returned chatId directly
            navigate(`/chats/${data.chatId}`);

            return data;

        } catch (err) {

            console.error(err);
            return null;
        }
    };

    // Get all chats
    const getChats = async (limit, skip) => {

        try {

            const response = await getUserChats(
                userData?._id,
                skip,
                limit
            );

            return response;

        } catch (err) {

            console.error(err);
            return null;
        }
    };

    // Get messages
    const getUserChatMessages = async (limit, skip, chatId) => {

        try {

            if (!chatId) return [];

            const response = await getChatMessages(
                chatId,
                skip,
                limit
            );

            return response;

        } catch (err) {

            console.error(err);
            return null;
        }
    };

    return (
        <ChatContext.Provider
            value={{
                currentChat,
                setCurrentChat,
                handleChat,

                receiverId,
                setReceiverId,

                receiverInfo,
                setReceiverInfo,

                getChats,
                sendAMessage,
                getUserChatMessages,
                handleCurrentChat,

                mobileDevice,
                setMobileDevice
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {

    return useContext(ChatContext);
};