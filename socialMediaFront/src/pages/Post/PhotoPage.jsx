import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { forward, backward, wrongWhite } from "../../assets/allImgs";

const PhotoPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const images = Array.isArray(state?.images) ? state.images : [];
  const initialIndex = typeof state?.index === "number" ? state.index : 0;

  const [idx, setIdx] = useState(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        navigate(state?.from ?? -1);
      } else if (e.key === "ArrowLeft") {
        setIdx((p) => Math.max((p ?? 0) - 1, 0));
      } else if (e.key === "ArrowRight") {
        setIdx((p) => Math.min((p ?? 0) + 1, images.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, state, images.length]);

  // If no images, render a simple fallback
  if (images.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <div>No image available</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">

      {/* image frame - padding prevents touching screen edges */}
      <div
        className="relative flex items-center justify-center w-full h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* prev */}
        <button
          className="absolute left-4 w-10 h-10 disabled:opacity-40 cursor-pointer"
          onClick={() => setIdx((p) => Math.max((p ?? 0) - 1, 0))}
          disabled={idx <= 0}
          aria-label="previous"
        >
          <img src={backward} alt="prev" />
        </button>

        {/* The image: constrain by viewport so it never overflows. object-contain keeps aspect ratio. */}
        <img
          src={images[idx]}
          alt={`image-${idx}`}
          className="max-w-[96vw] max-h-[92vh] w-auto h-auto object-contain"
          // prevent user selection / dragging interfering with layout
          draggable={false}
        />

        {/* next */}
        <button
          className="absolute right-4 w-10 h-10 disabled:opacity-40 cursor-pointer"
          onClick={() => setIdx((p) => Math.min((p ?? 0) + 1, images.length - 1))}
          disabled={idx >= images.length - 1}
          aria-label="next"
        >
          <img src={forward} alt="next" />
        </button>
      </div>
    </div>
  );
};

export default PhotoPage;