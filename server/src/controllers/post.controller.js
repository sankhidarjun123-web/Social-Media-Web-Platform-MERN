const Post = require('../models/Post.model');
const Channel = require('../models/Channel.model');
const User = require('../models/Users.model');
const Comment = require('../models/Comment.model');
const View = require('../models/View.model');
const Like = require('../models/Like.model');
const Follow = require('../models/Follow.model');
const { v4: uuidv4 } = require('uuid');
const { uploadToGCS, deleteFromGCS } = require("../utils/gcsServices");
const getImageMedia = require('../services/images.media.services');
const { post } = require('../routes/profile.route');
const Connections = require('../models/Connections.model');
import { postFetchService } from '../services/post.services';
const { sendNotification } = require('../services/notification.services');
import generateThumbnail from '../config/thumbnailGenerator';
import { extractMentions, extractHashtags } from '../utils/textParser';
import isValidLocation from '../utils/locationValidator';
import { postRanking } from '../services/feedRanking.services';

const visibilityOptions = ["Public", "Network", "Private"];

const uploadPost = async (req, res) => {

    let media = [];
    try {

        const user = req.user?.id;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const channel = await Channel.findOne({ user: user });

        if (!channel) {
            return res.status(404).json({ message: "Channel not found for the user" });
        }
        const files = req.files || [];

        if (!files.length && !req.body.text) {
            return res.status(400).json({ message: "Post cannot be empty" });
        }

        media = await Promise.all(
            files.map(async (file, index) => {
                if (file.mimetype.startsWith("image/")) {
                    return uploadToGCS(
                        file,
                        "post",
                        `img-${user}-${index}`,
                        { width: 1080, height: 1080 },
                        "image"
                    );
                } else if (file.mimetype.startsWith("video/")) {
                    return uploadToGCS(
                        file,
                        "post",
                        `vid-${user}-${index}`,
                        null,
                        "video"
                    );
                } else {
                    throw new Error("Unsupported file type");
                }
            })
        );

        const hashtags = extractHashtags(req.body.text);
        const updatedHashtags = [...new Set(
            hashtags.map(tag => tag.toLowerCase())
        )];

        let date = "";
        let location = "";
        if (req.body.location) {
            const [city, state, country] =
                req.body.location.split(", ");
            const anyFilled = city || state || country;
            const allFilled = city && state && country;
            if (anyFilled && !allFilled) {
                return res.status(400).json({ message: "Incomplete location" });
            }

            if (allFilled) {

                const trimmedCity = city.trim();
                const trimmedState = state.trim();
                const trimmedCountry = country.trim();

                if (
                    !isValidLocation(
                        trimmedCity,
                        trimmedState,
                        trimmedCountry
                    )
                ) {
                    return res.status(400).json({
                        message: "Incorrect location"
                    });
                }

                location = [city.trim(), state.trim(), country.trim()].join(", ");
            }
        }

        if (req.body.visibility && !visibilityOptions.includes(req.body.visibility)) {
            return res.status(400).json({ message: "Invalid visibility option" });
        }

        if (req.body.date) {

            date = new Date(req.body.date);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }

            if (date < new Date()) {
                return res.status(400).json({
                    message: "Date must be greater than current date and time"
                });
            }
        }

        const postId = uuidv4();
        const post = await Post.create({
            post_id: postId,
            postedBy: user,
            channel: channel._id,
            text: {
                words: req.body.text,
                hashtags: updatedHashtags
            },
            date: date || Date.now(),
            location: location,
            visibility: date > new Date() ? "Sheduled" : (req.body.visibility || "Public"),

            media: media.map(m => ({
                url: m.url,
                public_id: m.public_id,
                type: m.type
            }))
        });

        await Channel.updateOne(
            { user: user },
            {
                $inc: { postsCount: 1 }
            }, {
            runValidators: true
        }
        );

        const [followers, connectionsA, connectionsB] = await Promise.all([Follow.find({
            following: user
        }), Connections.find({
            sender: user,
            status: "accepted"
        }), Connections.find({
            receiver: user,
            status: "accepted"
        })]);

        const receivers = [
            ...followers.map(item => item.follower.toString()),
            ...connectionsA.map(item => item.receiver.toString()),
            ...connectionsB.map(item => item.sender.toString())
        ];

        const fullText = req.body.text;
        const previewText = fullText
            ? fullText.slice(0, 50) +
            (fullText.length > 50 ? "..." : "")
            : "";

        const userData = await User.findById(user).select("username profileImg").lean();
        await sendNotification({
            receiver: receivers,
            sender: user,
            type: "post",
            link: "/channel",
            mainMessage:
                `${userData.username} uploaded a post`,
            notMessage: previewText,
            image: userData?.profileImg
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (err) {
        console.error(err);
        if (media && media.length > 0) {
            await Promise.all(
                media.map((m) =>
                    deleteFromGCS(m.url, m.type)
                )
            );
        }
        res.status(500).json({
            message: err.message || "Upload failed"
        });
    }
};


// For fetching all the posts

const getAllPosts = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const limit = Number(req.query?.limit) || 10;
        const skip = Number(req.query?.skip) || 0;

        const posts = await postFetchService(user, { LIMIT: limit, SKIP: skip }, {
            postedBy: { $ne: user }, visibility: {
                $in: ["Public", "public"]
            }
        });

        const rankedPosts = await Promise.all(
            posts.map(async (post) => ({
                ...post,
                score: await postRanking(post, user)
            }))
        );

        rankedPosts.sort((a, b) => b.score - a.score);

        const totalPosts = await Post.countDocuments({
            postedBy: { $ne: user },
            visibility: {
                $in: ["Public", "public"]
            }
        });

        const noMorePosts = skip + limit >= totalPosts;

        res.status(200).json({
            message: "Posts fetched successfully",
            posts: rankedPosts,
            noMorePosts,
            nextSkip: skip + limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching posts",
            error: err.message
        });
    }
}

// For editing a post

const editPost = async (req, res) => {

    let uploadedMedia = [];

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const postId = req.params?.postId;

        if (!postId) {
            return res.status(400).json({
                message: "Post Id is required"
            });
        }

        const post = await Post.findOne({
            _id: postId,
            postedBy: user,
            isDeleted: false
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // -------------------------
        // NORMAL FIELD UPDATES
        // -------------------------

        if (req.body.text) {
            const hashtags = extractHashtags(req.body.text);
            post.text.hashtags = [...new Set(
                hashtags.map(tag => tag.toLowerCase())
            )];
            post.text.words = req.body.text;
        }

        if (req.body.visibility) {
            if (!visibilityOptions.includes(req.body.visibility) && req.body.visibility !== "Sheduled") {
                return res.status(400).json({ message: "Invalid visibility option" });
            }
            post.visibility = req.body.visibility;
        }

        if (req.body.location) {
            let location = "";
            const [city, state, country] =
                req.body.location.split(", ");
            const anyFilled = city || state || country;
            const allFilled = city && state && country;
            if (anyFilled && !allFilled) {
                return res.status(400).json({ message: "Incomplete location" });
            }

            if (allFilled) {

                const trimmedCity = city.trim();
                const trimmedState = state.trim();
                const trimmedCountry = country.trim();

                if (
                    !isValidLocation(
                        trimmedCity,
                        trimmedState,
                        trimmedCountry
                    )
                ) {
                    return res.status(400).json({
                        message: "Incorrect location"
                    });
                }

                location = [city.trim(), state.trim(), country.trim()].join(", ");
            }
            post.location = location;
        }

        if (req.body.date && req.body.date.length > 0) {
            let date = new Date(req.body.date);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }

            if (date < new Date()) {
                return res.status(400).json({
                    message: "Date must be greater than current date and time"
                });
            }

            post.date = date;
            if (date > new Date()) {
                post.visibility = "Sheduled";
            }
        }

        // -------------------------
        // REMOVE OLD MEDIA
        // -------------------------

        let removedMedia = [];

        if (req.body.removedMedia) {
            removedMedia = JSON.parse(req.body.removedMedia);
        }

        if (removedMedia.length > 0) {

            const mediaToDelete = post.media.filter((m) =>
                removedMedia.includes(m.url)
            );

            // delete from GCS
            await Promise.all(
                mediaToDelete.map((m) =>
                    deleteFromGCS(m.url, m.type)
                )
            );

            // keep remaining media
            post.media = post.media.filter(
                (m) => !removedMedia.includes(m.url)
            );
        }

        // -------------------------
        // UPLOAD NEW MEDIA
        // -------------------------

        const files = req.files || [];

        if (files.length > 0) {

            uploadedMedia = await Promise.all(
                files.map((file, index) => {

                    if (file.mimetype.startsWith("image/")) {

                        return uploadToGCS(
                            file,
                            "post",
                            `img-${user}-${Date.now()}-${index}`,
                            { width: 1080, height: 1080 },
                            "image"
                        );

                    } else if (file.mimetype.startsWith("video/")) {

                        return uploadToGCS(
                            file,
                            "post",
                            `vid-${user}-${Date.now()}-${index}`,
                            null,
                            "video"
                        );

                    } else {
                        throw new Error("Unsupported file type");
                    }
                })
            );

            // append new media
            post.media.push(
                ...uploadedMedia.map((m) => ({
                    url: m.url,
                    public_id: m.public_id,
                    type: m.type
                }))
            );
        }

        post.isEdited = true;

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate(
                "postedBy",
                "_id username firstname lastname profileImg"
            );

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (e) {

        console.error(e);

        // rollback uploaded files
        if (uploadedMedia.length > 0) {

            await Promise.all(
                uploadedMedia.map((m) =>
                    deleteFromGCS(m.url, m.type)
                )
            );
        }

        res.status(500).json({
            message: "Error updating post",
            error: e.message
        });
    }
};

// For getting a post
const getPost = async (req, res) => {

    try {

        const requestedBy = req.user?.id;

        if (!requestedBy) {
            return res.status(404).json({ message: "User not found" });
        }

        const postId = req.params?.postId;

        if (!postId) {
            console.log("Post Id is required");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userPost = await Post.findById(postId).populate("postedBy",
            "_id username firstname lastname channel profileImg followers followings connections location");

        if (!userPost || userPost.isDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }

        const channelVisible = await Channel.findById(userPost?.postedBy?.channel.toString()).select("visibility contentVisibility").lean();

        const liked = await Like.findOne({
            likedBy: requestedBy,
            postLiked: postId
        });

        const followed = await Follow.findOne({
            follower: requestedBy,
            following: userPost.postedBy._id.toString()
        })

        const connected = await Connections.findOne({
            $or: [
                { sender: requestedBy, receiver: userPost.postedBy._id.toString(), status: "accepted" },
                { sender: userPost.postedBy._id.toString(), receiver: requestedBy, status: "accepted" }
            ]
        });

        if ((userPost.visibility === "Private" 
        || userPost.visibility === "Sheduled"
        || channelVisible.visibility.toString() === "private"
        || channelVisible.contentVisibility.toString() === "private") 
        && (userPost.postedBy._id.toString() !== requestedBy)) {

            return res.status(403).json({ message: "This post is private" });
        }

        if ((userPost.visibility === "Network" || 
        channelVisible.visibility.toString() === "protected" || 
        channelVisible.contentVisibility.toString() === "protected") 
        && (!connected && !followed) 
        && (userPost.postedBy._id.toString() !== requestedBy)) {
            return res.status(403).json({ message: "This post is only visible to followers and connections" });
        }



        const postObj = userPost.toObject();
        postObj.isLiked = !!liked;
        postObj.isFollowed = !!followed;
        postObj.allowEdit = userPost.postedBy._id.toString() === requestedBy;

        let allowEdit = false;

        if (userPost.postedBy._id.toString() === requestedBy) {
            allowEdit = true;
        }

        res.status(200).json({ post: postObj, allowEdit });
    } catch (e) {
        res.status(500).json({ message: "Error fetching the post", error: e.message });
    }
}


// For deleting a post
const deletePost = async (req, res) => {

    try {

        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params?.postId;

        if (!postId) {
            console.log("Post Id not found");
            return res.status(404).json({ message: "Post Id required" });
        }

        const post = await Post.findOneAndUpdate({ _id: postId, postedBy: user }, {
            $set: { isDeleted: true }
        });

        if (!post) {
            console.log("Post already deleted");
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.media && post.media.length > 0) {
            await Promise.all(
                post.media.map((m) =>
                    deleteFromGCS(m.url, m.type)
                )
            );
        }

        await Promise.all([
            Like.deleteMany({
                likedPost: postId
            }),
            Comment.deleteMany({
                commentPost: postId
            }),
            View.deleteMany({
                viewedPost: postId
            })
        ]);

        await post.deleteOne();

        await Channel.updateOne(
            {
                user: user,
                postsCount: { $gt: 0 }
            },
            {
                $inc: { postsCount: -1 }
            }
        );

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (e) {

        res.status(500).json({
            message: "Error from server side",
            error: e.message
        });
    }
}


module.exports = { uploadPost, getAllPosts, editPost, deletePost, getPost };