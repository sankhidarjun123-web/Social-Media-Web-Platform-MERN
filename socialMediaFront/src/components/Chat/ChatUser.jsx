import { useState, useRef, useEffect } from "react";
import { threeDotHorizontal, user } from "../../assets/allImgs";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { createPortal } from "react-dom";
import { deleteChat } from "../../api/chatApi";

const dummyUserInfo = {
    username: "JoeDoe",
    firstname: "Joe",
    lastname: "Doe",
    profileImg: user
};

const ChatUser = ({ userInfo }) => {

    const { handleCurrentChat } = useChat();
    const { userData } = useAuth();
    const [deleted, setDeleted] = useState(false);

    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({
        top: 0,
        left: 0
    });

    const buttonRef = useRef(null);

    const handleDelete = async () => {
        console.log(userInfo._id)
        try {
            await deleteChat(userInfo._id);
            setDeleted(true);
        } catch (err) {
            console.error(err);
        }
    }

    const options = [
        {
            label: "Delete",
            onClick: (e) => {
                e.stopPropagation();
                handleDelete();
                setOpen(false);
            },
            danger: true
        }
    ];

    // Find OTHER participant
    const participant =
        userInfo?.participants?.find(
            participant =>
                participant._id !== userData?._id
        );

    const chatId = userInfo?._id;

    const {
        firstname,
        lastname,
        username,
        profileImg,
        channel,
        _id
    } = participant || dummyUserInfo;

    const chatChange = () => {
        const chatInfo = {
            firstname,
            lastname,
            username,
            profileImg,
            chatId,
            Id: _id,
            channelId: channel
        };

        handleCurrentChat(chatInfo);
    };

    const toggleMenu = (e) => {
        e.stopPropagation();

        const rect = buttonRef.current.getBoundingClientRect();

        setPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX - 40
        });

        setOpen(prev => !prev);
    };

    // Close on outside click
    useEffect(() => {
        const close = () => setOpen(false);

        window.addEventListener("click", close);

        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <div
            onClick={chatChange}
            className={`
                ${deleted && "hidden"}
                relative
                w-full
                h-[70px]
                flex-shrink-0
                flex items-center gap-3
                px-4
                cursor-pointer
                bg-white/5
                border border-white/10
                border-b-black/30
                hover:bg-black/10
                transition-all duration-200
                shadow-[0_2px_10px_rgba(0,0,0,0.18)]
                backdrop-blur-sm
            `}
        >

            <img
                src={profileImg || user}
                alt="profile"
                className="
                    w-11 h-11
                    rounded-full
                    object-cover
                    border border-white/10
                    flex-shrink-0
                "
            />

            <div className="flex flex-col min-w-0">

                <p className="text-sm font-semibold text-black truncate">
                    {firstname || ""} {lastname || ""}
                </p>

                <p className="text-xs text-gray-400 truncate">
                    @{username}
                </p>

            </div>

            <div
                className="absolute right-2"
                onClick={e => e.stopPropagation()}
            >
                <button
                    ref={buttonRef}
                    onClick={toggleMenu}
                    className="w-8 h-8 hover-btn-prop"
                >
                    <img src={threeDotHorizontal} alt="options" />
                </button>
            </div>

            {open &&
                createPortal(
                    <div
                        style={{
                            top: position.top,
                            left: position.left
                        }}
                        className="
                            absolute
                            z-[9999]
                            w-32
                            overflow-hidden
                            rounded-lg
                            bg-white
                            shadow-xl
                            border border-gray-200
                        "
                    >
                        {options.map((option, i) => (
                            <button
                                key={i}
                                onClick={option.onClick}
                                className={`
                                    w-full
                                    px-4
                                    py-2
                                    text-left
                                    text-sm
                                    cursor-pointer
                                    hover:bg-gray-100
                                    transition-colors
                                    ${option.danger ? "text-red-500" : "text-black"}
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default ChatUser;