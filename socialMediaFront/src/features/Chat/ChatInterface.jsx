import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { send, Search } from "../../assets/allImgs";
import MessageBox from "../../components/Chat/MessageBox";
import { Plus, X } from "lucide-react";
import ChatFooter from "./ChatFooter";
import ChatMain from "./ChatMain";
import ChatHeader from "./ChatHeader";

const ChatInterface = () => {
    const { mobileDevice, text, setText, media, setMedia, handleSend, receiverId, receiverInfo, setReceiverInfo, currentChat } = useOutletContext();
    const [submitedData, setSubmitedData] = useState({
    })
    const handleMediaChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setMedia({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith("image")
                ? "image"
                : "video"
        });
    };

    const removeMedia = () => {
        setMedia(null);
    };

    return (
        <section
            className={`
    relative w-full h-full overflow-hidden
    bg-gradient-to-b from-white to-zinc-100
    ${(receiverId || currentChat)
                    ? "flex flex-col sm:grid sm:grid-rows-[70px_1fr_130px]"
                    : "flex items-center justify-center"}
  `}
        >
            {(!receiverId && !currentChat) ? (
                <div
                    className="
        flex flex-col
        items-center
        justify-center
        text-center
        px-6
      "
                >
                    <div
                        className="
          w-24 h-24
          rounded-full
          bg-white
          shadow-lg
          border border-zinc-200
          flex items-center justify-center
          mb-5
        "
                    >
                        <img
                            src={Search}
                            alt="Chat"
                            className="w-9 opacity-40"
                        />
                    </div>

                    <h2
                        className="
          text-2xl
          font-semibold
          text-zinc-700
        "
                    >
                        Your Messages
                    </h2>

                    <p
                        className="
          text-sm
          mt-2
          text-zinc-400
          max-w-[250px]
        "
                    >
                        Select a chat to start messaging
                    </p>
                </div>
            ) : (
                <>
                    {/* HEADER */}
                    <ChatHeader
                        receiverId={receiverId}
                        receiverInfo={receiverInfo}
                        setReceiverInfo={setReceiverInfo}
                    />

                    {/* MAIN */}
                    <ChatMain
                        mobileDevice={mobileDevice}
                        setSubmitedData={setSubmitedData}
                        submitedData={submitedData}
                    />

                    {/* FOOTER */}
                    <ChatFooter
                        setSubmitedData={setSubmitedData}
                        text={text}
                        setText={setText}
                        handleSend={handleSend}
                        media={media}
                        handleMediaChange={handleMediaChange}
                        removeMedia={removeMedia}
                    />
                </>
            )}
        </section>
    );
};

export default ChatInterface;