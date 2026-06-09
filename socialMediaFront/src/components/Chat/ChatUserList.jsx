import { useState, useEffect, useRef } from "react";
import ChatSearch from "./ChatSearch";
import ChatUser from "./ChatUser";
import { useChat } from "../../contexts/ChatContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Loader from "../ui/Loader";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../socket/socket";



const ChatUsersList = ({ keyword, setKeyword }) => {

    const navigate = useNavigate();
    const { chatId } = useParams();
    const { userData } = useAuth();
    const { receiverId, getChats, setCurrentChat, setReceiverId, currentChat } = useChat();

    const {
        data,
        loading,
        noMore,
        fetchData,
        setData
    } = usePaginatedFetch(getChats, 10, "chats");

    const observerRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {

        const filteredChats = data.filter((chat) => {

            const participant =
                chat?.participants?.find(
                    participant =>
                        participant._id !== userData?._id
                );

            return participant?.username
                ?.toLowerCase()
                .includes(keyword.toLowerCase());

        });

        setData(filteredChats);

    }, [keyword]);

    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {

                const firstEntry = entries[0];

                if (
                    firstEntry.isIntersecting &&
                    !loading &&
                    !noMore
                ) {
                    fetchData();
                }
            },
            {
                threshold: 1
            }
        );

        const currentRef = observerRef.current;

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };

    }, [loading, noMore]);

    useEffect(() => {

        if (!receiverId) return;

        data.forEach((chat) => {

            const participant =
                chat?.participants?.find(
                    participant =>
                        participant._id !== userData?._id
                );

            if (receiverId === participant?._id) {
                setCurrentChat(chat._id);
                navigate(`/chats/${chat._id}`)
            }

        });

    }, [receiverId, data, userData]);

    useEffect(() => {

        const handleNewMessage = (messageData) => {

            setData(prev => {

                const updatedChats = [...prev];

                const index =
                    updatedChats.findIndex(
                        chat =>
                            chat._id ===
                            messageData.chat.chatId
                    );



                // EXISTING CHAT
                if (index !== -1) {

                    const existingChat =
                        updatedChats[index];

                    // update latest message
                    const updatedChat = {
                        ...existingChat,
                        latestMessage:
                            messageData.message
                    };

                    // remove old position
                    updatedChats.splice(index, 1);

                    // push on top
                    updatedChats.unshift(updatedChat);

                    return updatedChats;
                }



                // NEW CHAT
                const newChat = {
                    _id: messageData.chat.chatId,

                    participants:
                        messageData.chat.participants,

                    latestMessage:
                        messageData.latestMessage
                };

                return [
                    newChat,
                    ...updatedChats
                ];
            });
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };

    }, []);

    return (
        <div
            className="
                relative
                w-full
                h-full
                flex
                flex-col
                overflow-hidden
            "
        >
            <ChatSearch keyword={keyword} setKeyword={setKeyword} />

            <div
                className="
                    mt-16
                    overflow-y-auto
                    flex
                    flex-col
                "
                style={{ scrollbarWidth: "none" }}
            >
                {
                    data.map((chat, i) => (
                        <ChatUser
                            key={i}
                            userInfo={chat}
                        />
                    ))
                }
                <div ref={observerRef}>
                    {loading && <div className="w-full flex justify-center items-center">
                        <Loader size={16} />
                    </div>}
                    {noMore && <p className="w-full font-thin text-sm text-center">No more chats</p>}
                </div>
            </div>
        </div>
    );
}

export default ChatUsersList;