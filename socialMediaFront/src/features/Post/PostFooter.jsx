import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { like, comment, share, liked, views } from '../../assets/allImgs';

const PostFooter = ({ post, openComments, setOpenComments }) => {

  const SERVER = import.meta.env.VITE_SERVER_URL;

  const [likes, setLikes] = useState(post?.likes || 0);
  const comments = post?.comments || 0;

  const [isLiked, setLiked] = useState(false);

  const [sharing, setSharing] = useState(false);

  const handleShare = async (postId) => {
    console.log("Share clicked");

    try {
      const shareUrl = `${SERVER}/post/${postId}`;

      console.log("Sharing:", shareUrl);
      console.log(navigator.userAgent);

      await navigator.share({
        title: "Check out this post",
        text: "Found this interesting",
        url: shareUrl,
      });

      console.log("Share success");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLiked(post?.isLiked || false);
  }, [post]);

  const handleLike = async () => {

    setLiked((prev) => !prev);

    try {

      if (isLiked) {

        setLikes((prev) => Math.max(prev - 1, 0));

        await axios.delete(
          `${SERVER}/userMedia/posts/${post._id}/like`,
          { withCredentials: true }
        )
          .then(() => {
            console.log("unliked the post successfully");
          }).catch(() => {
            console.error("Some error occured");
          });

      } else {

        setLikes((prev) => prev + 1);

        await axios.post(
          `${SERVER}/userMedia/posts/${post._id}/like`,
          {},
          { withCredentials: true }
        )
          .then(() => {
            console.log("liked the post successfully");
          }).catch(() => {
            console.error("Some error occured");
          });

      }

    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  return (
    <div className="w-full px-3 py-2">

      <div className="flex items-center gap-2 flex-wrap">

        {/* Like */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-full px-2 py-1 shadow-sm">
          <button
            onClick={handleLike}
            className="cursor-pointer hover:scale-105 transition-all duration-200 w-5 h-5 sm:w-6 sm:h-6"
          >
            <img
              src={isLiked ? liked : like}
              alt="like"
              className="w-full h-full"
            />
          </button>

          <span className="text-[11px] sm:text-xs font-medium text-zinc-700 ml-1">
            {likes}
          </span>
        </div>

        {/* Comment */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-full px-2 py-1 shadow-sm">
          <button
            onClick={() => {
              openComments
                ? setOpenComments(false)
                : setOpenComments(true);
            }}
            className="cursor-pointer hover:scale-105 transition-all duration-200 w-5 h-5 sm:w-6 sm:h-6"
          >
            <img
              src={comment}
              alt="comment"
              className="w-full h-full"
            />
          </button>

          <span className="text-[11px] sm:text-xs font-medium text-zinc-700 ml-1">
            {comments}
          </span>
        </div>

        {/* Views */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-full px-2 py-1 shadow-sm">
          <img
            src={views}
            alt="views"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />

          <span className="text-[11px] sm:text-xs font-medium text-zinc-700 ml-1">
            {post?.views || 0}
          </span>
        </div>

        {/* Share */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-full px-2 py-1 shadow-sm">
          <button
            onClick={() => handleShare(post._id)}
            disabled={sharing}
            className="cursor-pointer hover:scale-105 transition-all duration-200 w-5 h-5 sm:w-6 sm:h-6"
          >
            <img
              src={share}
              alt="share"
              className="w-full h-full"
            />
          </button>
        </div>

      </div>

    </div>
  );
};

export default PostFooter;