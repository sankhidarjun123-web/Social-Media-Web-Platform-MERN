const { uploadPost, editPost, deletePost, getPost, getAllPosts } = require("../controllers/post.controller");
const { likePost, unlikePost, likeComment, unlikeComment, viewPost, sharePost } = require("../controllers/impression.controller");

const {
    uploadComment,
    getAllComments,
    getAllChildComments,
    updateComment,
    deleteComment
} = require("../controllers/comment.controller");
const { validateChannel, validatePost, validateComment } = require("../middlewares/userMiddleware");
const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Post request on an account
router.post("/post/create", upload.array("media", 20), uploadPost);

router.get("/posts", getAllPosts);

router.get("/posts/:postId", getPost);

router.patch("/posts/:postId", upload.array("media"), editPost);

router.delete("/posts/:postId", deletePost);

// Comment request on an accound and post
router.get("/posts/:postId/comments", getAllComments);

router.get("/posts/:postId/comments/:parentCommentId", getAllChildComments);

router.post("/posts/:postId/comments", uploadComment);

router.post("/posts/:postId/comments/child/:parentCommentId", uploadComment);

router.patch("/posts/:postId/comments/:commentId", updateComment);

router.delete("/posts/:postId/comments/:commentId", deleteComment);

router.delete("/posts/:postId/comments/:commentId/child/:parentCommentId", deleteComment);

// Like and view request on post and comments
router.post("/posts/:postId/like", likePost);

router.delete("/posts/:postId/like", unlikePost);

router.post("/posts/:postId/view", viewPost);

router.post("/posts/:postId/comments/:commentId/like", likeComment);

router.delete("/posts/:postId/comments/:commentId/like", unlikeComment);

router.get("/posts/:postId/shares", sharePost);

module.exports = router;