import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNetwork } from "../../contexts/NetworkContext";
import Dropdown from "../../components/ui/DropDown";
import { threeDotVertical, user, wrong } from "../../assets/allImgs";
import axios from "axios";
import DeletePostModal from "../../components/Post/DeletePostModel";
import Loader from "../../components/ui/Loader";
import EditPost from "../../components/Post/EditPost";
import timeAgo from "../../components/ui/timeAgo";

const PostHeader = ({ post, onPage, number, setRemove, setDeleted }) => {

  const navigate = useNavigate();

  // Network context functions for follow/unfollow
  const { followUser, unFollowUser } = useNetwork();

  // Follow state
  const [isFollowing, setIsFollowing] = useState(post?.isFollowed || false);

  // Delete modal states
  const [openDel, setOpenDel] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  // Edit modal states
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Stores current editable post data
  const [editData, setEditData] = useState({});

  const SERVER = import.meta.env.VITE_SERVER_URL;

  // Dropdown options array
  const options = [];

  // If the user owns the post
  // show edit/share/delete options
  if (post?.allowEdit) {

    options.push(

      {
        label: "Edit",

        onClick: () => {

          // Fill the edit modal with existing post data
          setEditData({
            _id: post?._id,
            text: post?.text?.words,
            media: post?.media,
            visibility: post?.visibility,
            hashtags: post?.text?.hashtags,
            location: post?.location,
            date: post?.date
          });

          console.log(editData);

          setOpenEdit(true);
        }
      },

      {
        label: "Share",
        onClick: () => console.log("Share", post?._id)
      },

      {
        label: "Delete",
        danger: true,
        onClick: () => setOpenDel(true)
      }

    );

  } else {

    // If user does not own the post
    // show share/report only
    options.push(

      {
        label: "Share",
        onClick: () => handleShare()
      },

      {
        label: "Report",
        onClick: () => console.log("Report", post?._id)
      }

    );
  }

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

  // Deletes the post from server
  const handleDelete = async () => {

    try {

      // Prevent duplicate requests
      if (delLoading) return;

      setDelLoading(true);

      await axios.delete(
        `${SERVER}/userMedia/posts/${post._id}`,
        {
          withCredentials: true
        }
      );

      console.log("Post deleted successfully");

      // Marks the post deleted in parent state
      setDeleted(prev => {

        const newRemove = [...prev];

        newRemove[number] = true;

        return newRemove;
      });

    } catch (err) {

      console.error(err.response?.data || err.message);

    } finally {

      setDelLoading(false);
      setOpenDel(false);
    }
  };

  // Allows keyboard navigation
  const handleKeyDown = (e) => {

    if (e.key === "Enter" || e.key === " ") {

      navigate(`/post/${post?._id}`, {
        state: { post }
      });
    }
  };

  // Follow / unfollow functionality
  const handleFollow = async (e) => {

    e.stopPropagation();

    try {

      if (isFollowing) {

        // Unfollow user
        setIsFollowing(false);

        await unFollowUser(post?.postedBy?._id || post?.postedBy);

        console.log(
          "Unfollowed user",
          post?.postedBy?._id || post?.postedBy
        );

      } else {

        // Follow user
        setIsFollowing(true);

        await followUser(post?.postedBy?._id || post?.postedBy);

        console.log(
          "Followed user",
          post?.postedBy?._id || post?.postedBy
        );
      }

    } catch (err) {

      console.error(err.message);
    }
  };

  // Prevent body scrolling when modal opens
  useEffect(() => {

    if (openDel || openEdit) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "";
    };

  }, [openDel, openEdit]);

  return (
    <>

      {/* Edit post modal */}
      {(openEdit && editData) &&

        <div
          className="fixed top-0 left-0 z-50 w-screen h-screen flex justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpenEdit(false)}
        >

          <div onClick={(e) => e.stopPropagation()}>

            <EditPost
              editData={editData}
              setEditData={setEditData}
            />

          </div>

        </div>
      }

      {/* Delete confirmation modal */}
      <DeletePostModal
        delLoading={delLoading}
        isOpen={openDel}
        onClose={() => setOpenDel(false)}
        onDelete={handleDelete}
        comment={false}
      />

      {/* Main header container */}
      <div

        onClick={() =>
          navigate(`/post/${post?._id}`, {
            state: { post }
          })
        }

        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}

        // Mobile optimized without changing desktop layout
        className="
          w-full
          min-h-20
          px-2 sm:px-4
          py-3
          border-b
          border-black
          flex
          items-center
          gap-2 sm:gap-5
          cursor-pointer
          bg-white
        "
      >

        {/* Left section */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-2 sm:gap-3
            p-1 sm:p-2
            min-w-0
          "
        >

          {/* User image + name section */}
          <div
            className="
              flex
              items-center
              gap-2 sm:gap-3
              min-w-0
            "
          >

            {/* Profile image */}
            <Link
              to={`/channel/${post?.postedBy?.channel}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >

              <div className="p-1 comp-gradient rounded-full flex justify-center items-center">

                <img
                  src={post?.postedBy?.profileImg || user}
                  alt="user"

                  // Smaller image on mobile
                  className="
                    w-9 h-9
                    sm:w-10 sm:h-10
                    rounded-full
                    object-cover
                    outline-2
                    outline-white
                    border-none
                    bg-white
                    hover:scale-105
                    transition
                  "
                />

              </div>

            </Link>

            {/* Name and username */}
            <div className="flex flex-col min-w-0 leading-tight">

              {/* Name row */}
              <div className="flex items-center gap-2 min-w-0">

                <Link
                  to={`/channel/${post?.postedBy?.channel}`}
                  onClick={(e) => e.stopPropagation()}

                  className="
                    font-semibold
                    text-sm sm:text-base
                    truncate
                    hover:text-blue-400
                    transition
                  "
                >

                  {post?.postedBy?.firstname
                    ? post.postedBy.firstname + " " +
                    (post.postedBy.lastname ?? "")
                    : "Unknown User"}

                </Link>

                {/* Time ago */}
                <span
                  className="
                    text-xs
                    text-gray-500
                    flex-shrink-0
                  "
                >
                  • {timeAgo(post?.createdAt)}
                </span>

                {/* Edited label */}
                <span
                  className="
                    text-xs
                    text-gray-500
                    flex-shrink-0
                  "
                >
                  {post?.isEdited && "(edited)"}
                </span>

              </div>

              {/* Username */}
              <span
                className="
                  text-xs
                  text-gray-500
                  truncate
                "
              >
                @{post?.postedBy?.username || "username"}
              </span>

            </div>

          </div>

        </div>

        {/* Right section */}
        <div
          className="
            ml-auto
            flex
            items-center
            gap-1 sm:gap-4
            flex-shrink-0
          "
        >

          {/* Follow button */}
          {!post?.allowEdit &&

            <button

              className={`
                px-2 sm:px-3
                py-1
                text-xs sm:text-sm
                rounded-md
                focus:outline-none
                cursor-pointer
                whitespace-nowrap
                ${!isFollowing
                  ? "font-bold btn-gradient text-white"
                  : "bg-gray-200 text-black"}
              `}

              onClick={handleFollow}
            >

              {isFollowing ? "Following" : "Follow"}

            </button>
          }

          {/* Dropdown menu */}
          <div onClick={(e) => e.stopPropagation()}>

            <Dropdown options={options}>

              <button
                className="
                  hover-btn-prop
                  w-8 h-8
                  sm:w-8 sm:h-8
                  cursor-pointer
                "
                type="button"
              >

                <img
                  src={threeDotVertical}
                  alt="options"
                />

              </button>

            </Dropdown>

          </div>

          {/* Remove button */}
          {!post?.allowEdit && !onPage &&

            <button

              onClick={(e) => {

                e.stopPropagation();

                setRemove(prev => {

                  const newRemove = [...prev];

                  newRemove[number] = true;

                  return newRemove;
                });
              }}

              className="focus:outline-none cursor-pointer"
            >

              <img
                src={wrong}
                alt="undo"

                className="
                  w-8 h-8
                  sm:w-8 sm:h-8
                  hover-btn-prop
                "
              />

            </button>
          }

        </div>

      </div>

    </>
  );
};

export default PostHeader;