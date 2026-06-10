const Post = require("../models/Post.model");
const Like = require("../models/Like.model");
const Impression = require("../models/View.model");
const Comment = require("../models/Comment.model");
const Users = require("../models/Users.model");
const { sendNotification } = require('../services/notification.services');


// Like controller

// For liking a post
const likePost = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            console.error("Unauthorized like attempt");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const post = await Post.findById(req.params.postId);

        if (!post || post.isDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }

        const liked = await Like.findOne({
            on: "post",
            likedBy: user,
            postLiked: post._id,
            postUser: post.postedBy
        });

        if (liked) {
            return res.status(409).json({ message: "Post already liked" });
        }


        const like = await Like.create({
            on: "post",
            likedBy: user,
            postLiked: post._id,
            postUser: post.postedBy
        });

        await Post.findByIdAndUpdate(post._id, {
            $inc: { likes: 1 }
        });

        const userData = await Users.findById(user).select("username").lean();

        await sendNotification({
            receiver: [post?.postedBy.toString()],
            sender: user,
            type: "like",
            link: "/post",
            image: userData?.profileImg,
            mainMessage:
                `${userData?.username} liked your post`
        });

        res.status(201).json({ message: "Like created" });

    } catch (error) {

        res.status(500).json({
            message: "Error liking the post",
            error: error.message
        });
    }
}

// For unliking a comment 
const unlikePost = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const post = await Post.findById(req.params.postId);

        if (!post || post.isDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }

        const delLike = await Like.findOneAndDelete({
            on: "post",
            likedBy: user,
            postLiked: post._id,
            postUser: post.postedBy
        });

        if (!delLike) {
            return res.status(404).json({ message: "You haven't liked this post yet" });
        }

        await Post.findByIdAndUpdate(post._id, {
            $inc: { likes: -1 }
        });

        res.status(200).json({ message: "Post unliked" });
    } catch (error) {

        console.error(error.message);
        res.status(500).json({ message: "Error unliking the post" });
    }
}


// Like on a comment
const likeComment = async (req, res) => {


    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { postId, commentId } = req.params;

        if (!postId) {
            return res.status(400).json({ message: "Post id is undefined" });
        }

        if (!commentId) {
            return res.status(400).json({ message: "Comment id is undefined" });
        }

        const comment = await Comment.findOne({
            _id: commentId,
            commentPost: postId
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const alreadyLiked = await Like.findOne({
            on: "comment",
            likedBy: user,
            commentLiked: commentId,
            commentUser: comment.postedBy
        });

        if (alreadyLiked) {
            return res.status(400).json({ message: "The comment was already liked" });
        }

        const like = await Like.create({
            on: "comment",
            likedBy: user,
            commentLiked: commentId,
            commentUser: comment.postedBy
        });

        await Comment.updateOne({ _id: commentId, commentPost: postId },
            { $inc: { likes: 1 } });

        const userData = await Users.findById(user).select("username").lean();

        await sendNotification({
            receiver: [comment?.postedBy.toString()],
            sender: user,
            type: "like",
            link: "/post",
            image: userData?.profileImg,
            mainMessage:
                `${userData?.username} liked your comment`
        });

        res.status(201).json({ message: "Like created" });

        res.status(201).json({ message: "Liked the comment successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error occured liking the comment" });
    }
}


// unliking the comment on the post
const unlikeComment = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { postId, commentId } = req.params;

        if (!postId) {
            return res.status(400).json({ message: "Post id is undefined" });
        }

        if (!commentId) {
            return res.status(400).json({ message: "Comment id is undefined" });
        }

        const comment = await Comment.findOne({
            _id: commentId,
            commentPost: postId
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const unlike = await Like.findOneAndDelete({
            on: "comment",
            likedBy: user,
            commentLiked: commentId,
            commentUser: comment.postedBy
        });

        if (!unlike) {
            return res.status(404).json({
                message: "You haven't liked this comment yet"
            });
        }

        await Comment.updateOne(
            { _id: commentId, commentPost: postId },
            { $inc: { likes: -1 } }
        );

        res.status(200).json({
            message: "Comment unliked successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error occured unliking the comment"
        });
    }
}

// view post (impression) controller
const viewPost = async (req, res) => {


    try {

        const user = req.user?.id;

        if (!user) {
            console.log("Unauthorized view attempt");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req?.params?.postId;

        const post = await Post.findById(req.params.postId);

        if (!post || post.isDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }

        const result = await Impression.updateOne(
            { post: postId, viewedBy: user },
            { $setOnInsert: { post: postId, viewedBy: user } },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            await Post.findByIdAndUpdate(postId, {
                $inc: { views: 1 }
            });
        }

        return res.status(200).json({ message: "View recorded" });

    } catch (err) {
        console.error("Error recording post view:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};


const sharePost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).send("Post id is required");
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { $inc: { shares: 1 } },
            { new: true }
        )
            .populate("postedBy", "username profileImg");

        if (!post) {
            return res.status(404).send("Post not found");
        }

        const title =
            `${post.postedBy?.username || "User"}'s Post`;

        const description =
            post?.text?.words?.slice(0, 150) ||
            "Check out this post";

        const firstMedia = post.media?.[0];

        const image =
            firstMedia?.type === "image"
                ? firstMedia.url
                : post.postedBy?.profileImg ||
                `${process.env.CLIENT_URL}/default-post.png`;

        return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>

            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${image}" />
            <meta property="og:type" content="article" />
            <meta property="og:url" content="${process.env.CLIENT_URL}/post/${post._id}" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${image}" />

            <meta http-equiv="refresh"
                  content="0;url=${process.env.CLIENT_URL}/post/${post._id}" />
        </head>
        <body>
            Redirecting...
        </body>
        </html>
        `);

    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
};


module.exports = {
    likePost,
    unlikePost,
    likeComment,
    unlikeComment,
    viewPost,
    sharePost
};