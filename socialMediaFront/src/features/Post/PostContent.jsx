import { useState } from "react";
import { playBtn, forward, backward } from "../../assets/allImgs";
import HighlightHashtags from "../../utils/HIghlightHashtags";

/* 🔹 TEXT BLOCK */
function TextBlock({ text, hashtags = [] }) {

  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 720;

  const shouldShorten = text?.length > MAX_LENGTH;

  const displayedText =
    expanded || !shouldShorten
      ? text
      : text.slice(0, MAX_LENGTH) + "...";

  return (
    <div className="px-4 pt-3">

      {/* TEXT */}
      {text && (
        <HighlightHashtags expanded={expanded} setExpanded={setExpanded} shouldShorten={shouldShorten} text={displayedText} />
      )}
    </div>
  );
}

/* 🔥 MEDIA SLIDER */
function MediaSlider({ media = [] }) {
  const [current, setCurrent] = useState(0);

  if (!media.length) return null;

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % media.length);
  };

  const handlePrev = () => {
    setCurrent((prev) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  };

  const item = media[current];
  const isVideo = item.url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="w-full mt-3 relative bg-black">

      {/* MEDIA DISPLAY */}
      <div className="w-full h-[400px] flex items-center justify-center">
        {isVideo ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={item.url}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* LEFT BUTTON */}
      {media.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 cursor-pointer -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
        >
          <img src={backward} alt="Previous" className="w-10 h-10" />
        </button>
      )}

      {/* RIGHT BUTTON */}
      {media.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 cursor-pointer -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
        >
          <img src={forward} alt="Next" className="w-10 h-10" />
        </button>
      )}

      {/* DOT INDICATORS */}
      {media.length > 1 && (
        <div className="absolute bottom-2 w-full flex justify-center gap-2">
          {media.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                i === current ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* 🔥 MAIN COMPONENT */
const PostContent = ({ post }) => {
  if (!post) return null;

  return (
    <div className="w-full bg-white">

      {/* TEXT + HASHTAGS */}
      <TextBlock
        text={post?.text?.words}
        hashtags={post?.text?.hashtags || []}
      />

      {/* MEDIA */}
      <MediaSlider media={post?.media || []} />

    </div>
  );
};

export default PostContent;