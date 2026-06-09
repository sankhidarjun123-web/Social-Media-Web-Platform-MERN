import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { user as userImg, threeDotHorizontal } from "../../assets/allImgs";
import { useAuth } from "../../contexts/AuthContext";
import Dropdown from "../../components/ui/DropDown";
import { useChat } from "../../contexts/ChatContext";
import { deleteChat } from "../../api/chatApi";



const ChatHeader = ({ receiverId, receiverInfo, setReceiverInfo }) => {

    const navigate = useNavigate();
    const [online, setOnline] = useState(false);
    const { onlineUsers } = useAuth();
    const { currentChat, setReceiverId, setCurrentChat } = useChat();

    const handleDelete = async () => {

        try {
            await deleteChat(currentChat);
            setCurrentChat(null);
            setReceiverId(null);
            setReceiverInfo({});
            navigate("/chats");
        } catch (err) {
            console.error(err);
        }
    }

    const option = [{
        label: "Delete",
        onClick: handleDelete,
        danger: true
    }]

    useEffect(() => {
        if (onlineUsers.includes(receiverId)) {
            setOnline(true);
        } else {
            setOnline(false);
        }
    }, [onlineUsers, receiverId])

    return <header onClick={() => navigate(`/channel/${receiverInfo?.channelId}`)} className="w-full fixed sm:sticky top-16 sm:top-0 z-10 backdrop-blur-md bg-white/80 border-b border-zinc-200 flex items-center justify-between px-5 shadow-sm">

        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full justify-center">
                <img src={receiverInfo?.profileImg || userImg} alt="user image" className="rounded-full" />
            </div>

            <div>
                <h2 className="font-semibold text-zinc-800 text-[15px]">
                    {receiverInfo?.firstname || "Select a user to start conversation"} {receiverInfo?.lastname || ""}
                </h2>

                <div
                    className={`
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${online ? "max-h-5 opacity-100" : "max-h-0 opacity-0"}
    `}
                >
                    <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {online ? "Online" : ""}
                    </p>
                </div>
            </div>
        </div>

        <div onClick={e => e.stopPropagation()}>
            <Dropdown options={option}>
                <button className="w-10 h-10 hover-btn-prop">
                    <img src={threeDotHorizontal} alt="options" />
                </button>
            </Dropdown>
        </div>
    </header>
}


export default ChatHeader;