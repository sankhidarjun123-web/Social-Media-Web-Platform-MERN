import { useState, useEffect } from "react";
import { send } from "../../assets/allImgs";
import { Plus, X } from "lucide-react";
import { useChat } from "../../contexts/ChatContext";


const ChatFooter = ({ setSubmitedData, text, setText, handleSend, media, handleMediaChange, removeMedia }) => {

    const { currentChat, receiverInfo } = useChat();
    const handleSubmit = async () => {

        setText("");
        removeMedia();
        const data = await handleSend();
        setSubmitedData(data.sendMessage);
    }
    return <footer className="max-sm:fixed max-sm:bottom-0 max-sm:h-[50px] relative w-full h-full bg-zinc-100 border-t border-zinc-200 flex items-center px-2">

        {(currentChat && !receiverInfo.allowChats) ? <div className="w-full text-red-500 text-center">Sorry this account doesn't want to receiver messages</div> : <>
            {/* FLOATING MEDIA PREVIEW */}
            {media && (
                <div className="absolute bottom-full left-3 mb-2 z-30">
                    <div className="relative w-fit">

                        {media.file.type.startsWith("image") ? (
                            <img
                                src={media.preview}
                                alt="preview"
                                className="w-28 h-28 rounded-2xl object-cover border border-zinc-300 shadow-xl"
                            />
                        ) : (
                            <video
                                src={media.preview}
                                controls
                                className="w-28 h-28 rounded-2xl object-cover border border-zinc-300 shadow-xl"
                            />
                        )}

                        <button
                            onClick={removeMedia}
                            className="absolute cursor-pointer -top-2 -right-2 bg-black text-white rounded-full p-1 hover:scale-110 transition-all duration-200"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            <input
                id="fileInput"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaChange}
            />

            <label
                htmlFor="fileInput"
                className="absolute left-2 w-10 h-10 rounded-full hover:bg-zinc-200 cursor-pointer transition-all duration-200 flex items-center justify-center z-10"
            >
                <Plus size={20} />
            </label>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                rows={1}
                maxLength={10000}
                placeholder="Type a message"
                style={{
                    resize: "none",
                    scrollbarWidth: "none"
                }}
                className="
            w-full
            h-24
            max-h-40
            overflow-y-auto
            pl-14
            pr-14
            pt-3
            border-none
            rounded-xl
            bg-zinc-100
            focus:outline-none
            text-[15px]
            text-zinc-800
            placeholder:text-zinc-400
        "
            />

            <button
                onClick={handleSubmit}
                className="
            cursor-pointer
            absolute
            right-3
            w-10
            h-10
            rounded-full
            bg-gradient-to-r
            from-blue-500
            to-indigo-500
            flex
            items-center
            justify-center
            shadow-md
            hover:scale-105
            transition-all
            duration-200
        "
            >
                <img
                    src={send}
                    alt="Send"
                    className="w-4 invert brightness-0"
                />
            </button>
        </>}
    </footer>
}


export default ChatFooter;