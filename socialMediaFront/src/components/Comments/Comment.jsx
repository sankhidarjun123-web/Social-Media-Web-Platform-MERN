import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Loader from "../ui/Loader";
import {
    user,
    like,
    liked,
    comment as commentIcon,
    threeDotVertical
} from "../../assets/allImgs";

import timeAgo from "../ui/timeAgo";
import Dropdown from "../ui/DropDown";
import DeletePostModal from "../Post/DeletePostModel";
import CommentInput from "./CommentInput";

import useCommentItem from "../../hooks/useCommentItems";
import { useAuth } from "../../contexts/AuthContext";
import { deleteComment } from "../../api/commentApi";

const Comment = ({
    comment,
    aChildComment = false,
    depth = 0
}) => {

    // =========================================
    // Per Comment Hook
    // =========================================

    const {

        text,
        setText,

        // Like
        liked: comLike,
        likes: comLikes,
        handleLike,
        handleUnLike,

        // Edit
        openEditMode,
        setOpenEditMode,
        editText,
        setEditText,
        commentText,
        handleEdit,
        editLoading,

        // Delete
        openDelete,
        setOpenDelete,
        handleDelete,
        deleteLoading,

        // Replies
        childComments,
        openReplies,
        setOpenReplies,
        fetchReplies,
        loadingReplies,
        repliesNoMore,
        loadPosting,
        postAChildComment

    } = useCommentItem(comment);

    const { userData } = useAuth();
    const [typed, setTyped] = useState(false);
    const [openInput, setOpenInput] = useState(false);

    useEffect(() => {

        if (text !== "") {
            setTyped(true);
        } else {
            setTyped(false);
        }
    }, [text]);
    // =========================================
    // Dropdown Options
    // =========================================

    const options = [];

    if (comment?.allowEdit) {

        options.push(
            {
                label: "Edit",
                onClick: () => setOpenEditMode(true)
            },
            {
                label: "Share",
                onClick: () => console.log("Share")
            },
            {
                label: "Delete",
                danger: true,
                onClick: () => setOpenDelete(true)
            }
        );

    } else {

        options.push(
            {
                label: "Share",
                onClick: () => console.log("Share")
            },
            {
                label: "Report",
                onClick: () => console.log("Report")
            }
        );

    }

    return (

        <div className={`w-full ${aChildComment ? "pl-5 sm:pl-7" : ""}`}>
            {/* Parent Connector Line */}

            {aChildComment && (

                <div className="
                        border-l
                        border-gray-200
                        pl-4">

                    {/* Main Comment */}

                    <div className="
                            flex
                            gap-3
                            w-full
                            py-3">

                        {/* Delete Modal */}

                        <DeletePostModal
                            delLoading={deleteLoading}
                            isOpen={openDelete}
                            onClose={() =>
                                setOpenDelete(false)
                            }
                            onDelete={handleDelete}
                            comment={true}
                        />

                        {/* Avatar */}

                        <Link to={`/channel/${comment?.postedBy?.channel}`}>

                            <div className="
                                    p-1
                                    comp-gradient
                                    rounded-full
                                    flex
                                    justify-center
                                    items-center
                                    shrink-0">

                                <img
                                    src={
                                        comment?.postedBy?.profileImg
                                        || user
                                    }
                                    alt="user"
                                    className="
                                            w-8
                                            h-8
                                            rounded-full
                                            object-cover
                                            outline-2
                                            outline-white
                                            bg-white
                                            hover:scale-105
                                            transition" />

                            </div>

                        </Link>

                        {/* Main Content */}

                        <div className="
                                flex
                                flex-col
                                w-full
                                min-w-0
                            ">

                            {/* Header */}

                            <div className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                    w-full
                                ">

                                <div className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        flex-wrap
                                    ">

                                    <Link
                                        to={`/channel/${comment?.postedBy?.channel}`}
                                        className="
                                                font-semibold
                                                text-gray-900
                                                hover:underline
                                                truncate
                                            "
                                    >
                                        {
                                            comment?.postedBy?.username
                                        }
                                    </Link>

                                    <span className="
                                            text-gray-400
                                            text-xs
                                        ">
                                        • {
                                            timeAgo(
                                                comment?.createdAt
                                            )
                                        }
                                    </span>

                                    {
                                        comment?.isEdited && (
                                            <span className="
                                                    text-gray-400
                                                    text-xs
                                                ">
                                                (edited)
                                            </span>
                                        )
                                    }

                                </div>

                                {/* Dropdown */}

                                <Dropdown options={options}>

                                    <button
                                        className="
                                                hover-btn-prop
                                                w-6
                                                h-6
                                                sm:w-8
                                                sm:h-8
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

                            {/* Edit Mode */}

                            {
                                openEditMode ? (

                                    <div className="
                                            mt-2
                                            bg-gray-50
                                            border
                                            border-gray-200
                                            rounded-2xl
                                            p-3
                                            flex
                                            flex-col
                                            gap-3
                                        ">

                                        <input
                                            value={editText}
                                            onChange={(e) =>
                                                setEditText(
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-gray-300
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-gray-800
                                                    outline-none
                                                    focus:ring-2
                                                    focus:ring-blue-400
                                                    focus:border-blue-400
                                                    transition
                                                    bg-white
                                                "
                                            placeholder="
                                                    Edit your comment...
                                                "
                                        />

                                        <div className="
                                                flex
                                                items-center
                                                justify-end
                                                gap-2
                                            ">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenEditMode(
                                                        false
                                                    )
                                                }
                                                className="
                                                        px-4
                                                        py-2
                                                        text-sm
                                                        rounded-xl
                                                        text-gray-700
                                                        transition
                                                        cursor-pointer
                                                    "
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleEdit}
                                                disabled={
                                                    !editText.trim()
                                                    || editLoading
                                                }
                                                className={`
                                                        px-4
                                                        py-2
                                                        text-sm
                                                        rounded-xl
                                                        transition
                                                        cursor-pointer
                                                        ${!editText.trim()
                                                        || editLoading
                                                        ? "not-allowed-button"
                                                        : "btn-gradient text-white"
                                                    }
                                                    `}
                                            >

                                                {
                                                    editLoading
                                                        ? "Saving..."
                                                        : "Save"
                                                }

                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <p className="
                                            text-gray-800
                                            text-sm
                                            leading-relaxed
                                            mt-1
                                            break-words
                                        ">
                                        {commentText}
                                    </p>

                                )
                            }

                            {/* Actions */}

                            <div className="
                                    flex
                                    items-center
                                    gap-5
                                    text-xs
                                    text-gray-500
                                    mt-2
                                ">

                                {/* Like */}

                                <button
                                    onClick={
                                        comLike
                                            ? handleUnLike
                                            : handleLike
                                    }
                                    className="
                                            cursor-pointer
                                            flex
                                            items-center
                                            gap-1
                                            hover:text-blue-500
                                            transition
                                        "
                                >

                                    <img
                                        src={
                                            comLike
                                                ? liked
                                                : like
                                        }
                                        alt="like"
                                        className="
                                                w-4
                                                h-4
                                                opacity-70
                                            "
                                    />

                                    <span>
                                        {comLikes}
                                    </span>

                                </button>

                                {/* Replies */}

                                {
                                    !aChildComment && (

                                        <button
                                            onClick={() => {

                                                if (openReplies) {

                                                    setOpenReplies(
                                                        false
                                                    );

                                                } else {

                                                    fetchReplies();

                                                }

                                            }}
                                            className="
                                                    cursor-pointer
                                                    flex
                                                    items-center
                                                    gap-1
                                                    hover:text-blue-500
                                                    transition
                                                "
                                        >

                                            <img
                                                src={commentIcon}
                                                alt="comment"
                                                className="
                                                        w-4
                                                        h-4
                                                        opacity-70
                                                    "
                                            />

                                            {
                                                comment?.childComments > 0 && (
                                                    <span>
                                                        {
                                                            comment.childComments
                                                        }
                                                    </span>
                                                )
                                            }

                                        </button>

                                    )
                                }

                                {/* Reply */}

                                {
                                    !aChildComment && (

                                        <button
                                            className="
                                                    cursor-pointer
                                                    hover:text-blue-500
                                                    transition
                                                "
                                        >
                                            Reply
                                        </button>

                                    )
                                }

                            </div>

                            {/* Child Comments */}

                            {
                                openReplies && (

                                    <div className="
                                            mt-3
                                            flex
                                            flex-col
                                        ">

                                        {
                                            loadingReplies && (

                                                <p className="
                                                        text-xs
                                                        text-gray-400
                                                    ">
                                                    Loading replies...
                                                </p>

                                            )
                                        }

                                        {
                                            childComments?.map(
                                                (reply) => (

                                                    <Comment
                                                        key={reply._id}
                                                        comment={reply}
                                                        aChildComment={
                                                            true
                                                        }
                                                        depth={
                                                            depth + 1
                                                        }
                                                    />

                                                )
                                            )
                                        }

                                    </div>

                                )
                            }

                        </div>

                    </div>

                </div>

            )
            }

            {/* Root Comment */}

            {
                !aChildComment && (

                    <div className="
                        flex
                        gap-3
                        w-full
                        py-3
                    ">

                        {/* Delete Modal */}

                        <DeletePostModal
                            delLoading={deleteLoading}
                            isOpen={openDelete}
                            onClose={() =>
                                setOpenDelete(false)
                            }
                            onDelete={handleDelete}
                            comment={true}
                        />

                        {/* Avatar */}

                        <Link
                            to={`/channel/${comment?.postedBy?.channel}`}
                        >

                            <div className="
                                p-1
                                comp-gradient
                                rounded-full
                                flex
                                justify-center
                                items-center
                                shrink-0
                            ">

                                <img
                                    src={
                                        comment?.postedBy?.profileImg
                                        || user
                                    }
                                    alt="user"
                                    className="
                                        w-8
                                        h-8
                                        rounded-full
                                        object-cover
                                        outline-2
                                        outline-white
                                        bg-white
                                        hover:scale-105
                                        transition
                                    "
                                />

                            </div>

                        </Link>

                        {/* Main Content */}

                        <div className="
                            flex
                            flex-col
                            w-full
                            min-w-0
                        ">

                            {/* Header */}

                            <div className="
                                flex
                                items-start
                                justify-between
                                gap-2
                                w-full
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    flex-wrap
                                ">

                                    <Link
                                        to={`/channel/${comment?.postedBy?.channel}`}
                                        className="
                                            font-semibold
                                            text-gray-900
                                            hover:underline
                                            truncate
                                        "
                                    >
                                        {
                                            comment?.postedBy?.username
                                        }
                                    </Link>

                                    <span className="
                                        text-gray-400
                                        text-xs
                                    ">
                                        • {
                                            timeAgo(
                                                comment?.createdAt
                                            )
                                        }
                                    </span>

                                    {
                                        comment?.isEdited && (
                                            <span className="
                                                text-gray-400
                                                text-xs
                                            ">
                                                (edited)
                                            </span>
                                        )
                                    }

                                </div>

                                <Dropdown options={options}>

                                    <button
                                        className="
                                            hover-btn-prop
                                            w-6
                                            h-6
                                            sm:w-8
                                            sm:h-8
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

                            {/* Edit Mode */}

                            {
                                openEditMode ? (

                                    <div className="
                                        mt-2
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        rounded-2xl
                                        p-3
                                        flex
                                        flex-col
                                        gap-3
                                    ">

                                        <input
                                            value={editText}
                                            onChange={(e) =>
                                                setEditText(
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                px-4
                                                py-3
                                                text-sm
                                                text-gray-800
                                                outline-none
                                                focus:ring-2
                                                focus:ring-blue-400
                                                focus:border-blue-400
                                                transition
                                                bg-white
                                            "
                                            placeholder="
                                                Edit your comment...
                                            "
                                        />

                                        <div className="
                                            flex
                                            items-center
                                            justify-end
                                            gap-2
                                        ">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenEditMode(
                                                        false
                                                    )
                                                }
                                                className="
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    rounded-xl
                                                    text-gray-700
                                                    transition
                                                    cursor-pointer
                                                "
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleEdit}
                                                disabled={
                                                    !editText.trim()
                                                    || editLoading
                                                }
                                                className={`
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    rounded-xl
                                                    transition
                                                    cursor-pointer
                                                    ${!editText.trim()
                                                        || editLoading
                                                        ? "not-allowed-button"
                                                        : "btn-gradient text-white"
                                                    }
                                                `}
                                            >

                                                {
                                                    editLoading
                                                        ? "Saving..."
                                                        : "Save"
                                                }

                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <p className="
                                        text-gray-800
                                        text-sm
                                        leading-relaxed
                                        mt-1
                                        break-words
                                    ">
                                        {commentText}
                                    </p>

                                )
                            }

                            {/* Actions */}

                            <div className="
                                flex
                                items-center
                                gap-5
                                text-xs
                                text-gray-500
                                mt-2
                            ">

                                <button
                                    onClick={
                                        comLike
                                            ? handleUnLike
                                            : handleLike
                                    }
                                    className="
                                        cursor-pointer
                                        flex
                                        items-center
                                        gap-1
                                        hover:text-blue-500
                                        transition
                                    "
                                >

                                    <img
                                        src={
                                            comLike
                                                ? liked
                                                : like
                                        }
                                        alt="like"
                                        className="
                                            w-4
                                            h-4
                                            opacity-70
                                        "
                                    />

                                    <span>
                                        {comLikes}
                                    </span>

                                </button>

                                <button
                                    onClick={() => {

                                        if (openReplies) {

                                            setOpenReplies(
                                                false
                                            );

                                        } else {
                                            setOpenReplies(true);
                                            fetchReplies();

                                        }

                                    }}
                                    className="
                                        cursor-pointer
                                        flex
                                        items-center
                                        gap-1
                                        hover:text-blue-500
                                        transition
                                    "
                                >

                                    <img
                                        src={commentIcon}
                                        alt="comment"
                                        className="
                                            w-4
                                            h-4
                                            opacity-70
                                        "
                                    />

                                    {
                                        comment?.childComments > 0 && (
                                            <span>
                                                {
                                                    comment.childComments
                                                }
                                            </span>
                                        )
                                    }

                                </button>

                                <button
                                    onClick={() => setOpenInput(!openInput)
                                    }
                                    className="
                                        cursor-pointer
                                        hover:text-blue-500
                                        transition
                                    "
                                >
                                    Reply
                                </button>

                            </div>

                            {/*Comment Input*/}
                            {openInput && <CommentInput post={comment} text={text} setText={setText} typed={typed} setTyped={setTyped} loadingPost={loadPosting} postAComment={postAChildComment} userData={userData} onComment={true} parentComment={comment?._id} />}
                            {/* Replies */}
                            {
                                openReplies && (

                                    <div className="
                                        mt-4
                                        flex
                                        flex-col
                                        gap-1">

                                        {loadingReplies && <div className="w-full flex justify-center items-center">
                                            <Loader size={16} />
                                        </div>}
                                        {childComments?.map(
                                            (reply) => (

                                                <Comment
                                                    key={reply._id}
                                                    comment={reply}
                                                    aChildComment={true}
                                                    depth={depth + 1} />

                                            )
                                        )
                                        }

                                        {(!repliesNoMore && !loadingReplies) &&
                                            <div className="w-full flex justify-center items-center">
                                                <button
                                                    onClick={() => fetchReplies()}
                                                    type="button"
                                                    className="hover-btn-prop w-8 h-8">
                                                    <Plus />
                                                </button>
                                            </div>}

                                        {repliesNoMore && <div className="w-full flex justify-center items-center">
                                            <span className="text-gray-500 text-sm sm:text-base">No more comments</span>
                                        </div>}
                                    </div>

                                )
                            }

                        </div>

                    </div>

                )
            }

        </div>

    );
};

export default Comment;