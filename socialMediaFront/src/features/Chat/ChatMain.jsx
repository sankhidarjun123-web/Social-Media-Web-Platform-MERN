import { useState, useEffect, useRef } from "react";
import { Search } from "../../assets/allImgs";
import { useParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import MessageBox from "../../components/Chat/MessageBox";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import Loader from "../../components/ui/Loader";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../socket/socket";
import { deleteAMessage } from "../../api/chatApi";
import { ArrowLeft } from "lucide-react";




const ChatMain = ({ mobileDevice, setSubmitedData, submitedData }) => {

    const navigate = useNavigate();
    const { error, setError } = useOutletContext();
    const { userData } = useAuth();
    const { chatId } = useParams();
    const observerRef = useRef(null);
    const [resetComplete, setResetComplete] =
        useState(false);
    const {
        receiverId,
        setReceiverId,
        getUserChatMessages,
        currentChat,
        setCurrentChat
    } = useChat();

    const handleDelete = async (message) => {

        try {
            setMessages(prev => {

                const filtered =
                    prev.filter(msg => msg._id !== message._id);

                return [
                    ...filtered
                ];
            });
            await deleteAMessage(message.chat, message._id);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchMessages = (limit, skip) => {

        return getUserChatMessages(
            limit,
            skip,
            currentChat
        );
    };

    const {
        data: messages,
        loading,
        noMore,
        fetchData,
        setData: setMessages,
        resetData: resetMessages
    } = usePaginatedFetch(
        fetchMessages,
        10,
        "messages",
        "prepend"
    );

    useEffect(() => {

        const handleNewMessage = (messageData) => {

            // check if currently opened chat
            if (
                messageData?.chat.chatId !== currentChat
            ) {
                return;
            }

            setMessages(prev => {

                // prevent duplicates
                const alreadyExist =
                    prev.some(
                        msg =>
                            msg._id ===
                            messageData?.message?._id
                    );

                console.log(messageData.message);
                if (alreadyExist) {
                    return prev;
                }

                return [
                    ...prev,
                    messageData.message
                ];
            });
        };



        socket.on(
            "new_message",
            handleNewMessage
        );



        return () => {

            socket.off(
                "new_message",
                handleNewMessage
            );
        };

    }, [currentChat]);


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

        if (Object.keys(submitedData).length === 0
        ) {
            return;
        }

        setMessages(prev => [

            ...prev,

            {
                ...submitedData
            }

        ]);

        setSubmitedData({
        });

    }, [submitedData]);

    useEffect(() => {

        if (!currentChat) return;

        resetMessages();

        setResetComplete(true);

    }, [currentChat]);

    useEffect(() => {

        if (!resetComplete) return;

        fetchData();

        setResetComplete(false);

    }, [resetComplete]);

    return (

        <main
            className="
                relative
                pt-16
                w-full
                h-full
                flex flex-col-reverse
                overflow-y-auto
                px-4
                py-5
                bg-zinc-200
                max-sm:pb-40
            "
        >

            {(!currentChat && !receiverId) ? (

                <div className="
                    w-full h-full
                    flex flex-col
                    items-center
                    justify-center
                    text-zinc-400
                ">

                    <div className="
                        w-24 h-24
                        rounded-full
                        bg-white
                        shadow-lg
                        border border-zinc-200
                        flex items-center justify-center
                        mb-5
                    ">

                        <img
                            src={Search}
                            alt="Chat"
                            className="w-9 opacity-40"
                        />

                    </div>

                    <h2 className="
                        text-xl
                        font-semibold
                        text-zinc-600
                    ">
                        Your Messages
                    </h2>

                    <p className="
                        text-sm mt-2 text-zinc-400
                    ">
                        Select a chat to start messaging
                    </p>

                </div>

            ) : (

                <>
                    {mobileDevice && (
                        <button
                            onClick={() => { setReceiverId(null); setCurrentChat(null); navigate("/chats") }}
                            className="
            fixed
            top-28
            left-4
            z-30
            w-10
            h-10
            rounded-full
            bg-white
            shadow-md
            border
            border-zinc-200
            flex
            items-center
            justify-center
        "
                        >
                            <ArrowLeft
                                size={22}
                                className="text-zinc-700"
                            />
                        </button>
                    )}
                    {[...messages]
                        .reverse()
                        .map((message, i) => (

                            <MessageBox
                                key={message._id}
                                message={message}
                                handleDelete={handleDelete}
                            />
                        ))
                    }
                    <div ref={observerRef}>
                        {loading && (
                            <div className="
                            w-full flex
                            justify-center
                            items-center
                        ">
                                <Loader size={20} />
                            </div>
                        )}

                        {messages.length > 0 && noMore && (
                            <p className="
                            w-full
                            text-sm
                            font-light
                            text-center
                            max-sm:mb-10
                        ">
                                No More Messages
                            </p>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default ChatMain;