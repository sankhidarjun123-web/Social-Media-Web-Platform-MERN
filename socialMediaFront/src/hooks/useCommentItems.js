import { useRef, useState } from "react";

import {
    postComment,
    likeComment,
    unLikeComment,
    deleteComment,
    editComment,
    getChildComments
} from "../api/commentApi";

const useCommentItem = (comment) => {


    const [text, setText] = useState("");

    // =========================================
    // Like states
    // =========================================

    const [liked, setLiked] = useState(
        comment?.liked || false
    );

    const [likes, setLikes] = useState(
        comment?.likes || 0
    );

    // =========================================
    // Edit states
    // =========================================

    const [openEditMode, setOpenEditMode] =
        useState(false);

    const [editText, setEditText] = useState(
        comment?.text?.words || ""
    );

    const [commentText, setCommentText] = useState(
        comment?.text?.words || ""
    );

    const [editLoading, setEditLoading] =
        useState(false);

    // =========================================
    // Delete states
    // =========================================

    const [openDelete, setOpenDelete] =
        useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    // =========================================
    // Child comments
    // =========================================

    const [childComments, setChildComments] =
        useState([]);

    const [openReplies, setOpenReplies] =
        useState(false);

    const [loadingReplies, setLoadingReplies] =
        useState(false);

    const [loadPosting, setLoadPosting] =
        useState(false);

    const [repliesNoMore, setRepliesNoMore] =
        useState(false);

    // =========================================
    // Error
    // =========================================

    const [error, setError] = useState("");

    const skipRef = useRef(0);


    const postAChildComment = async (parentComment) => {

        if (!text.trim()) return;

        setLoadPosting(true);

        try {

            const data = await postComment(
                comment?.commentPost,
                text,
                parentComment
            );

            // Main comment
            setChildComments(prev =>
                [ ...prev, data.comment ]);


            setText("");

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setLoadPosting(false);

        }
    };


    const deleteChildComment = async () => {


    }

    // =========================================
    // Like comment
    // =========================================

    const handleLike = async () => {

        setLiked(true);
        setLikes(prev => prev + 1);

        try {

            await likeComment(
                comment.commentPost,
                comment._id
            );

        } catch (err) {

            console.error(err);

            // rollback
            setLiked(false);
            setLikes(prev => prev - 1);

            setError(err.message);
        }
    };

    // =========================================
    // Unlike comment
    // =========================================

    const handleUnLike = async () => {

        setLiked(false);

        setLikes(prev =>
            prev - 1 < 0 ? 0 : prev - 1
        );

        try {

            await unLikeComment(
                comment.commentPost,
                comment._id
            );

        } catch (err) {

            console.error(err);

            // rollback
            setLiked(true);
            setLikes(prev => prev + 1);

            setError(err.message);
        }
    };

    // =========================================
    // Edit comment
    // =========================================

    const handleEdit = async () => {

        if (!editText.trim()) return;

        setEditLoading(true);

        try {

            const data = await editComment(
                comment.commentPost,
                comment._id,
                editText
            );

            setCommentText(data.comment.text.words);

            setOpenEditMode(false);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setEditLoading(false);

        }
    };

    // =========================================
    // Delete comment
    // =========================================

    const handleDelete = async (
        onDeleteSuccess
    ) => {

        if (deleteLoading) return;

        setDeleteLoading(true);

        try {

            await deleteComment(
                comment.commentPost,
                comment._id,
                comment.parentComment
            );

            setOpenDelete(false);

            // remove from parent UI
            if (onDeleteSuccess) {
                onDeleteSuccess(comment._id);
            }

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setDeleteLoading(false);

        }
    };

    // =========================================
    // Fetch child comments
    // =========================================

    const fetchReplies = async () => {

        if (loadingReplies || repliesNoMore) return;

        setLoadingReplies(true);

        try {

            const data = await getChildComments(
                comment.commentPost,
                comment._id,
                skipRef.current
            );

            if (data.comments.length === 0) {
                setRepliesNoMore(true);
            }

            setChildComments(prev => [...prev, ...data.comments]);

            skipRef.current = data.nextSkip;
            setRepliesNoMore(data.noMore);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setLoadingReplies(false);

        }
    };

    return {

        text,
        setText,
        loadPosting,
        setLoadPosting,
        postAChildComment,
        // Like
        liked,
        likes,
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

        // Error
        error
    };
};

export default useCommentItem;