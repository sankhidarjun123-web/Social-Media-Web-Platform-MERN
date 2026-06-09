import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { playBtn, user } from "../../assets/allImgs";

const VideoCard = ({ contentInfo }) => {

  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  const videoRef = useRef(null);

  // VIDEO URL
  const videoUrl =
    contentInfo?.url ||
    contentInfo?.video ||
    contentInfo?.media?.url ||
    "";

  // PREVIEW PLAY
  const handleMouseEnter = () => {

    setIsHovered(true);

    if (videoRef.current) {

      videoRef.current.currentTime = 0;

      videoRef.current.play().catch(() => {});

    }
  };

  // STOP PREVIEW
  const handleMouseLeave = () => {

    setIsHovered(false);

    if (videoRef.current) {

      videoRef.current.pause();

      videoRef.current.currentTime = 0;

    }
  };

  return (
    <div
      className="
        w-full
        bg-white
        overflow-hidden
        relative
        flex
        flex-col
        rounded-2xl
        shadow-md
        hover:shadow-2xl
        cursor-pointer
        transition-all
        duration-300
        group
      "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* VIDEO */}
      <div
        className="
          relative
          w-full
          aspect-[9/16]
          bg-black
          overflow-hidden
        "
        onClick={() => navigate(`/post/${contentInfo?.postId}`)}
      >

        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="
            w-full
            h-full
            object-cover
            group-hover:scale-105
            transition-transform
            duration-500
          "
        />

        {/* DARK OVERLAY */}
        <div
          className="
            absolute
            inset-0
            bg-black/10
            group-hover:bg-black/20
            transition-all
            duration-300
          "
        />

        {/* PLAY BUTTON */}
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
          "
        >

          <img
            src={playBtn}
            alt="play"
            className={`
              w-12
              h-12
              sm:w-16
              sm:h-16
              opacity-90
              drop-shadow-xl
              transition-all
              duration-300

              ${isHovered
                ? "scale-110 opacity-0"
                : "scale-100 opacity-100"
              }
            `}
          />

        </div>

      </div>

      {/* USER INFO */}
      <div
        className="
          w-full
          flex
          items-center
          gap-3
          px-3
          py-3
        "
      >

        <button
          className="
            w-10
            h-10
            rounded-full
            overflow-hidden
            flex-shrink-0
            hover:opacity-80
            transition-opacity
          "
        >

          <img
            src={user}
            alt="user"
            className="w-full h-full object-cover"
          />

        </button>

        <div className="flex flex-col min-w-0">

          <button
            className="
              font-semibold
              text-sm
              text-gray-900
              hover:text-blue-600
              transition-colors
              truncate
              text-left
            "
          >
            Arjun Sankhi
          </button>

          <p
            className="
              text-xs
              text-gray-500
              truncate
            "
          >
            Video post
          </p>

        </div>

      </div>

    </div>
  );
};

export default VideoCard;