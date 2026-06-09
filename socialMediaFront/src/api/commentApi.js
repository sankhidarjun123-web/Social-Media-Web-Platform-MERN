import axios from "axios";

const SERVER = import.meta.env.VITE_SERVER_URL;

// Post comment
const postComment = async (postId, text, parentComment) => {

    const url = parentComment
        ? `${SERVER}/userMedia/posts/${postId}/comments/child/${parentComment}`
        : `${SERVER}/userMedia/posts/${postId}/comments`;

    const response = await axios.post(
        url,
        { text },
        { withCredentials: true }
    );

    return response.data;
};

// Get comments
const getComments = async (postId, limit, skip) => {

    const response = await axios.get(
        `${SERVER}/userMedia/posts/${postId}/comments?limit=${limit}&skip=${skip}`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

// Like comment
const likeComment = async (postId, commentId) => {

    const response = await axios.post(
        `${SERVER}/userMedia/posts/${postId}/comments/${commentId}/like`,
        {},
        {
            withCredentials: true
        }
    );

    return response.data;
};

// Unlike comment
const unLikeComment = async (postId, commentId) => {

    const response = await axios.delete(
        `${SERVER}/userMedia/posts/${postId}/comments/${commentId}/like`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

// Delete comment
const deleteComment = async (postId, commentId, parentCommentId) => {

    const response = parentCommentId ? await axios.delete(`${SERVER}/userMedia/posts/${postId}/comments/${commentId}/child/${parentCommentId}`,
        {
            withCredentials: true
        }) : await axios.delete(
        `${SERVER}/userMedia/posts/${postId}/comments/${commentId}`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

// Edit comment
const editComment = async (postId, commentId, text) => {

    const response = await axios.patch(
        `${SERVER}/userMedia/posts/${postId}/comments/${commentId}`,
        { text },
        {
            withCredentials: true
        }
    );

    return response.data;
};

// Get child comments
const getChildComments = async (postId, parentCommentId, skip) => {

    const response = await axios.get(
        `${SERVER}/userMedia/posts/${postId}/comments/${parentCommentId}?limit=10&skip=${skip}`,
        {
            withCredentials: true
        }
    );

    return response.data;
};

export {
    postComment,
    getComments,
    likeComment,
    unLikeComment,
    deleteComment,
    editComment,
    getChildComments
};