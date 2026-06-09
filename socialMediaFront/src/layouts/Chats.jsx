import { useState, useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import ChatUsersList from "../components/Chat/ChatUserList";
import { useChat } from "../contexts/ChatContext";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import { getChat } from "../api/chatApi";

const Chats = () => {

    const { chatId } = useParams();
    const { receiverId, mobileDevice, setMobileDevice, receiverInfo, setReceiverInfo, currentChat, setCurrentChat, sendAMessage } = useChat();
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");

    const handleSend = async () => {
        try {
            if (text.length <= 0 && !media) return;
            const data = await sendAMessage(text, media);

            return data;
        } catch (err) {
            console.error(err);

            return {};
        }
    }

    const getChatData = async (chatId) => {

        try {
            const response = await getChat(chatId);

            console.log(response?.data);

            const participantInfo = response?.data?.chat?.participants[0];
            setReceiverInfo({
                channelId: participantInfo?.channel,
                username: participantInfo?.username,
                firstname: participantInfo?.firstname,
                lastname: participantInfo?.lastname || "",
                profileImg: participantInfo?.profileImg,
                onlineStatus: participantInfo?.isOnline,
                allowChats: participantInfo?.allowChats
            });
            setCurrentChat(chatId);
        } catch (err) {
            setReceiverInfo({
                channelId: "",
                username: "",
                firstname: "",
                lastname: "",
                profileImg: "",
                onlineStatus: false,
                allowChats: true
            });
            setCurrentChat(null);
        }
    }

    useEffect(() => {
        if (!chatId) return;

        getChatData(chatId);
    }, [chatId]);

    useEffect(() => {

        document.title = "Chats | Vibeo";

        return () => {
            document.title = "Vibeo";
        };

    }, []);

    return (
        <div className="w-full h-full flex overflow-hidden min-h-0">

            {/* DESKTOP */}
            {!mobileDevice && (
                <>
                    {/* SIDEBAR */}
                    <div className="w-[350px] h-full min-h-0 flex flex-col border-r">
                        <ChatUsersList
                            keyword={keyword}
                            setKeyword={setKeyword}
                        />
                    </div>

                    {/* CHAT BOX */}
                    <div className="flex-1 h-full min-h-0">{
                        (error && error.length > 0) ?
                            <div className="w-full text-center text-red-600">{error}</div> :
                            <Outlet
                                context={{
                                    mobileDevice,
                                    currentChat,
                                    text,
                                    setText,
                                    media,
                                    setMedia,
                                    handleSend,
                                    receiverId,
                                    receiverInfo,
                                    setReceiverInfo,
                                    setError,
                                    error
                                }}
                            />
                    }
                    </div>
                </>
            )}

            {/* MOBILE */}
            {mobileDevice && (
                <>
                    {/* SIDEBAR */}
                    {!receiverId && !currentChat && (
                        <div className="w-full h-full min-h-0 flex flex-col">
                            <ChatUsersList
                                keyword={keyword}
                                setKeyword={setKeyword}
                            />
                        </div>
                    )}

                    {/* CHAT BOX */}
                    {(receiverId || currentChat) && (
                        <div className="flex-1 h-full min-h-0">
                            <Outlet
                                context={{
                                    mobileDevice,
                                    currentChat,
                                    text,
                                    setText,
                                    media,
                                    setMedia,
                                    handleSend,
                                    receiverId,
                                    receiverInfo,
                                    setReceiverInfo
                                }}
                            />
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

export default Chats;