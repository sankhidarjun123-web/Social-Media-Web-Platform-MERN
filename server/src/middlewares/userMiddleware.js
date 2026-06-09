const mongoose = require("mongoose");
const Channel = require("../models/Channel.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");


const validateChannel = async (req, res, next) => {

    try {
        const channelId = req.params.channelId;

        if (!channelId) {
            return res.status(404).json({ message: "Channel not found" });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        req.channel = channel;
        next();
    } catch(error) {
        return res.status(400).json({ message: "Invalid channel id" });
    }
}

const validatePost = async(req, res, next) => {

    try {

        const postId = req.params.postId;

        if(!postId) {
            return res.status(404).json({ message : "Post not found" });
        }


        const post = await Post.findById(postId);

        if(!post || post.isDeleted) {
            return res.status(404).json({ message : "Post not found" });
        }

        req.post = post;
        next();
    } catch(error) {
        res.status(400).json({ message : "Invalid post id" });
    }
}

const validateComment = async(req, res, next) => {

    try {

        const commentId = req.params.commentId;

        if(!commentId) {
            return res.status(404).json({ message : "Comment not found" });
        }

        const comment = await Comment.findById(commentId);

        if(!comment || comment.isDeleted) {
            return res.status(404).json({ message : "Comment not found" });
        }

        req.comment = comment;
        next();
    } catch (error) {
        res.status(400).json({ message : "Invalid comment id" });
    }
}

module.exports = { validateChannel, validatePost, validateComment };