import { useState, useRef } from "react";

import {
    getComments,
    postComment,
    likeComment,
    unLikeComment,
    deleteComment,
    editComment,
    getChildComments
} from "../api/commentApi";

const useComment = (postId) => {

    // Main states
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    // Loading states
    const [loadingPost, setLoadingPost] = useState(false);
    const [loadingGet, setLoadingGet] = useState(false);

    // Pagination
    const [noMore, setNoMore] = useState(false);
    const [skip, setSkip] = useState(0);

    // Error
    const [error, setError] = useState("");

    const commentLoaderRef = useRef(false);

    // =========================================
    // Fetch comments
    // =========================================

    const fetchComments = async () => {

        if (noMore || commentLoaderRef.current || loadingGet) return;

        commentLoaderRef.current = true;
        setLoadingGet(true);

        try {

            const data = await getComments(postId, 10, skip);

            setComments(prev => [
                ...prev,
                ...data.comments
            ]);

            setSkip(data.nextSkip);
            setNoMore(data.noMore);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            commentLoaderRef.current = false;
            setLoadingGet(false);

        }
    };

    // =========================================
    // Post comment / reply
    // =========================================

    const postAComment = async (parentComment) => {

        if (!text.trim()) return;

        setLoadingPost(true);

        try {

            const data = await postComment(
                postId,
                text,
                parentComment
            );

            // Main comment
            if (!parentComment) {

                setComments(prev => [
                    data.comment,
                    ...prev
                ]);

            }


            setText("");

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setLoadingPost(false);

        }
    };

    return {

        // Main
        text,
        setText,
        comments,
        error,

        // Loading
        loadingPost,
        loadingGet,

        // Pagination
        noMore,

        // Fetch
        fetchComments,

        // Post
        postAComment,
    };
};

export default useComment;