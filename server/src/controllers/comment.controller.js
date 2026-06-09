const Like = require('../models/Like.model');
const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const Users = require('../models/Users.model');
const Notifications = require('../models/Notification.model');
const { sendNotification } = require('../services/notification.services');

// Comment controller

// For uploading a comment
const uploadComment = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }


        const postId = req.params.postId;

        if (!postId) {
            return res.status(404).json({ message: "Post not found" });
        }

        const parentCommentId = req.params.parentCommentId
            ? req.params.parentCommentId
            : null;

        console.log(parentCommentId);
        const { text, visibility } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Missing format" });
        }

        let commentVisibility = "public";
        if (visibility !== undefined) {
            commentVisibility = visibility;
        }

        if (parentCommentId) {

            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent Comment not found" });
            }
        }

        const commentingPost = await Post.findById(postId);

        if (!commentingPost || commentingPost.isDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await Comment.create({
            text: {
                words: text,
            },
            postedBy: user,
            commentPost: postId,
            parentComment: parentCommentId,
            isDeleted: false,
            isEdited: false,
            visibility: commentVisibility
        });

        const commentStructed = await comment.populate("postedBy");

        await Post.updateOne(
            { _id: postId },
            { $inc: { comments: 1 } }
        );

        if (parentCommentId) {
            await Comment.updateOne(
                { _id: parentCommentId },
                { $inc: { childComments: 1 } }
            );
        }

        const fullText = text;
        const previewText = fullText
            ? fullText.slice(0, 50) +
            (fullText.length > 50 ? "..." : "")
            : "";

        const [userData, postUser] = await Promise.all([
            Users.findById(user).select("username profileImg").lean(),
            Post.findById(postId).select("postedBy").lean()]);

        if (parentCommentId) {
            console.log(parentCommentId);
            const parentUser = await Comment.findById(parentCommentId)
                .select("postedBy")
                .lean();

            if (parentUser?.postedBy.toString() !== user) {
                await sendNotification({
                    receiver: [parentUser?.postedBy.toString()],
                    sender: user,
                    type: "reply",
                    link: "/post",
                    image: userData?.profileImg,
                    mainMessage:
                        `${userData?.username} replyed to your comment`,
                    notMessage: previewText
                });
            }
        }

        if (postUser?.postedBy.toString() !== user) {
            await sendNotification({
                receiver: [postUser?.postedBy.toString()],
                sender: user,
                type: "comment",
                link: "/post",
                image: userData?.profileImg,
                mainMessage:
                    `${userData?.username} commented on your post`,
                notMessage: previewText
            });
        }

        res.status(201).json({ message: "Commented successfuly!", comment: commentStructed });
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Error adding comment to your database", error: err.message });
    }
}

// For getting all comments on a particular post
const getAllComments = async (req, res) => {

    const LIMIT = Number(req.query?.limit) || 10;
    const SKIP = Number(req.query?.skip) || 0;

    try {

        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        if (!postId) {
            return res.status(404).json({ message: "Post not found" });
        }

        const postValidator = await Post.findById(postId);

        if (!postValidator) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ commentPost: postId, parentComment: null })
            .populate("postedBy")
            .sort({ createdAt: -1 })
            .limit(LIMIT)
            .skip(SKIP)
            .lean();

        const commentIds = comments.map(c => c._id);
        const likes = await Like.find({
            likedBy: user,
            commentLiked: { $in: commentIds }
        });
        const likedCommentIds = new Set(
            likes.map(like => like.commentLiked.toString())
        );

        const totalComments = await Comment.countDocuments({
            commentPost: postId,
            parentComment: null
        });

        if (comments.length == 0) {
            return res.status(200).json({ message: "No comments yet", comments: [], noMore: true, nextSkip: 0 });
        }

        const commentResponse = comments.map((comment) => ({
            ...comment,
            liked: likedCommentIds.has(comment._id.toString()),
            allowEdit: user === comment.postedBy?._id?.toString()
        }));


        res.status(200).json({
            comments: commentResponse,
            noMore: SKIP + LIMIT >= totalComments,
            nextSkip: SKIP + LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error from server" });
    }
}


// For getting all child comments on a particular post
const getAllChildComments = async (req, res) => {

    const LIMIT = Number(req.query?.limit) || 10;
    const SKIP = Number(req.query?.skip) || 0;

    try {

        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        if (!postId) {
            return res.status(404).json({ message: "Post not found" });
        }

        const postValidator = await Post.findById(postId);

        if (!postValidator) {
            return res.status(404).json({ message: "Post not found" });
        }

        const parrentCommentId = req?.params?.parentCommentId;

        if (!parrentCommentId) {
            return res.status(400).json({ message: "Parrent comment id not provided" });
        }

        const comments = await Comment.find({ commentPost: postId, parentComment: parrentCommentId })
            .populate("postedBy")
            .sort({ createdAt: -1 })
            .limit(LIMIT)
            .skip(SKIP)
            .lean();

        const commentIds = comments.map(c => c._id);
        const likes = await Like.find({
            likedBy: user,
            commentLiked: { $in: commentIds }
        });
        const likedCommentIds = new Set(
            likes.map(like => like.commentLiked.toString())
        );

        const totalComments = await Comment.countDocuments({
            commentPost: postId,
            parentComment: parrentCommentId
        });

        if (comments.length == 0) {
            return res.status(200).json({ message: "No comments yet", comments: [], noMore: true, nextSkip: 0 });
        }

        const commentResponse = comments.map((comment) => ({
            ...comment,
            liked: likedCommentIds.has(comment._id.toString()),
            allowEdit: user === comment.postedBy?._id?.toString()
        }));


        res.status(200).json({
            comments: commentResponse,
            noMore: SKIP + LIMIT >= totalComments,
            nextSkip: SKIP + LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error from server" });
    }
}


// For updating a comment
const updateComment = async (req, res) => {
    try {
        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        if (!postId) {
            return res.status(404).json({ message: "Post not found" });
        }


        const commentId = req.params.commentId;

        if (!commentId) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const { text, visibility } = req.body;

        if (!text) {
            return res.status(400).json({ message: "No text to update the comment" });
        }

        let updates = {
            text: {
                words: text
            },
            isEdited: true
        };

        if (visibility !== undefined) {
            updates.visibility = visibility;
        }

        const comment = await Comment.findOneAndUpdate({ _id: commentId, postedBy: user, commentPost: postId }, {
            $set: updates
        }, { new: true, runValidators: true });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        res.status(200).json({ message: "Comment edited", comment });
    } catch (err) {
        res.status(500).json({ message: "Unexpected error occured", error: err.message });
    }

}

// For deleting a comment
const deleteComment = async (req, res) => {

    try {

        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).json({ message: "Post id is required" });
        }

        const parentCommentId = req.params.parentCommentId || null;
        const commentOn = req.query.cO;

        if (commentOn === "comment" && !parentCommentId) {
            return res.status(400).json({ message: "Parent comment id is required" });
        }
        const commentId = req.params.commentId;


        if (!commentId) {
            return res.status(400).json({ message: "Comment id is required" });
        }

        const comment = await Comment.findOneAndDelete({ _id: commentId, postedBy: user, commentPost: postId, parentComment: parentCommentId || null });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        await Post.updateOne(
            { _id: postId },
            { $inc: { comments: -1 } }
        );

        if (parentCommentId) {
            await Comment.updateOne({
                _id: parentCommentId
            }, { $inc: { childComments: -1 } });
        }

        res.status(200).json({ message: "Comment successfully deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting comment", error: err.message });
    }
}

module.exports = {
    uploadComment,
    getAllComments,
    getAllChildComments,
    updateComment,
    deleteComment
};