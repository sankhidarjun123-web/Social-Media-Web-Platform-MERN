import { useState, useEffect } from "react";
import { user } from "../../assets/allImgs";
import { Trash2 } from "lucide-react";

const MessageMedia = ({ media }) => {

    if (!media?.url) return null;

    return (
        <div className="mb-2 overflow-hidden rounded-xl">

            {media.type === "image" ? (

                <img
                    src={media.url}
                    alt="message-media"
                    className="
                        max-w-full
                        rounded-xl
                        object-cover
                    "
                />

            ) : media.type === "video" ? (

                <video
                    src={media.url}
                    controls
                    className="
                        max-w-full
                        rounded-xl
                    "
                />

            ) : null}

        </div>
    );
};

const MessageBox = ({ message, handleDelete }) => {

    const [hover, setHover] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (

        <div
            className={`
                w-full
                flex
                mb-4
                px-2
                ${message?.isSend
                    ? "justify-end"
                    : "justify-start"
                }
            `}
        >

            <div
                className={`
                    flex
                    gap-2
                    max-w-[85%]
                    sm:max-w-[75%]
                    ${message?.isSend
                        ? "flex-row-reverse"
                        : "flex-row"
                    }
                `}
            >

                {/* Profile Image */}
                <img
                    src={message?.sender?.profileImg || user}
                    alt="profile"
                    className="
                        w-8 h-8
                        rounded-full
                        object-cover
                        flex-shrink-0
                        shadow-md
                    "
                />

                {/* Message Section */}
                <div
                    className={`
                        flex
                        flex-col
                        min-w-0
                        ${message?.isSend
                            ? "items-end"
                            : "items-start"
                        }
                    `}
                >

                    {/* Message Bubble */}
                    <div className="relative group max-w-full">

                        {/* Trash Button */}
                        {(message?.isSend && isMobile) && (
                            <button
                                onClick={() => handleDelete(message)}
                                className={`
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                    group-hover:opacity-100
                                    transition
                                    w-10 h-10
                                    flex
                                    justify-center
                                    items-center
                                    hover-btn-prop
                                    -left-12
                                `}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}

                        <div
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className={`
                                px-4
                                py-2.5
                                rounded-2xl
                                text-sm
                                leading-relaxed
                                shadow-md
                                backdrop-blur-sm
                                transition-all
                                duration-200
                                max-w-full
                                overflow-hidden
                                break-words
                                break-all
                                whitespace-pre-wrap
                                min-w-0
                                ${message?.isSend
                                    ? `
                                        comp-gradient
                                        text-white
                                        rounded-br-md
                                      `
                                    : `
                                        bg-white
                                        text-black
                                        border
                                        border-zinc-200
                                        rounded-bl-md
                                      `
                                }
                            `}
                        >

                            {message?.type !== "text" && (
                                <MessageMedia media={message?.media} />
                            )}

                            <p className="w-full">
                                {message?.encryptedMessage}
                            </p>

                        </div>

                    </div>

                    {/* Message Meta */}
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mt-1
                            px-1
                        "
                    >

                        <p
                            className="
                                text-[11px]
                                text-zinc-500
                                font-medium
                            "
                        >
                            {message?.isSend
                                ? "You"
                                : message?.sender?.username
                            }
                        </p>

                        <span
                            className="
                                w-1
                                h-1
                                rounded-full
                                bg-zinc-400
                            "
                        />

                        <p
                            className="
                                text-[10px]
                                text-zinc-400
                            "
                        >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default MessageBox;