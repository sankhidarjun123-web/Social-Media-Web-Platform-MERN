const Channel = require('../models/Channel.model');
const Users = require('../models/Users.model');
const Post = require('../models/Post.model');
const Follow = require('../models/Follow.model');
const Like = require('../models/Like.model');
const Connections = require('../models/Connections.model');


// User request the channel
const getChannel = async (req, res) => {
    try {
        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const channel_Id = req.params.channelId;

        if (!channel_Id) {
            return res.status(400).json({ message: "Channel id required for search" });
        }

        const channel = await Channel.findById(channel_Id)
            .select("-__v -visibility -contentVisibility -allowComments")
            .lean();

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }


        const channelOwner = await Users.findById(channel.user)
            .select("firstname lastname profileImg bio coverImg websites location DOB connections followers followings -_id isOnline allowChats allowConnections")
            .lean();

        if (!channelOwner) {
            return res.status(404).json({ message: "Channel owner not found" });
        }

        const allowCustomization =
            channel.user.toString() === user.toString();


        let isFollower = false;
        let isFollowing = false;
        const connectionStatus = {
            sender: "",
            receiver: ""
        };

        if (channel.user.toString() !== user.toString()) {

            const [folAB, folBA, conAB, conBA] = await Promise.all([
                Follow.findOne({
                    follower: user,
                    following: channel.user
                }).lean(),

                Follow.findOne({
                    follower: channel.user,
                    following: user
                }).lean(),

                Connections.findOne({
                    sender: user,
                    receiver: channel.user
                }).lean(),

                Connections.findOne({
                    sender: channel.user,
                    receiver: user
                })
            ]);

            isFollowing = !!folAB; // logged user follows channel owner
            isFollower = !!folBA; // channel owner follows logged user

            if (!!conAB) {
                connectionStatus.sender = conAB.status;
            }

            if (!!conBA) {
                connectionStatus.receiver = conBA.status;
            }
        }

        res.status(200).json({
            message: "Channel found",
            channel,
            channelOwner,
            allowCustomization,
            isFollower,
            isFollowing,
            connectionStatus
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching the channel details" });
    }
};


// Request to get the posts of a channel
const getChannelPosts = async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = req.query.skip ? Number(req.query.skip) : 0;

    const query = {};

    try {
        const user = req.user.id;
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const channelId = req.params.channelId;
        if (!channelId) {
            return res.status(400).json({ message: "Channel ID is required" });
        }

        const channelUser = await Channel.findById(channelId).select("user").lean();

        if (!channelUser) {
            return res.status(404).json({ message: "Channel not found" });
        }
        const follow = await Follow.findOne({
            follower: user,
            following: channelUser.user
        });

        const connection = await Connections.findOne({
            $or: [
                { sender: user, receiver: channelUser.user },
                { sender: channelUser.user, receiver: user }
            ]
        });

        query.channel = channelId;
        query.isDeleted = false;
        query.visibility = {
            $in: ["Public"]
        };

        if (follow || connection) {
            query.visibility.$in.push("Network");
        }

        if (channelUser.user.toString() === user.toString()) {
            query.visibility.$in.push("Network");
            query.visibility.$in.push("Private");
            query.visibility.$in.push("Sheduled");
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate(
                "postedBy",
                "_id username firstname lastname profileImg followers followings connections location"
            );

        const postIds = posts.map(p => p._id);
        const userIds = posts.map(p => p.postedBy._id);
        console.log(userIds);

        const likes = await Like.find({
            likedBy: user,
            postLiked: { $in: postIds }
        });

        const follows = await Follow.find({
            follower: user,
            following: { $in: userIds }
        });

        const likedPostIds = new Set(
            likes.map(like => like.postLiked.toString())
        );

        const followedPostIds = new Set(
            follows.map(follow => follow.following.toString())
        )

        const updatedPosts = posts.map(post => {
            const postObj = post.toObject();
            postObj.isLiked = likedPostIds.has(post._id.toString());
            postObj.isFollowed = followedPostIds.has(post.postedBy._id.toString());
            postObj.allowEdit = post.postedBy._id.toString() === user;

            return postObj;
        });

        const totalPosts = await Post.countDocuments(query);

        const noMore = skip + posts.length >= totalPosts;

        res.status(200).json({
            posts: updatedPosts,
            nextSkip: skip + posts.length,
            noMore
        });

    } catch (err) {
        console.error("Error fetching channel posts:", err);
        res.status(500).json({
            message: "Error fetching posts",
            error: err.message
        });
    }
};

// Set or update the about section of the channel
const setAbout = async (req, res) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { channelId } = req.params;

        if (!channel_Id) {
            return res.status(400).json({ message: "Channel Id required" });
        }

        const { about } = req.body;

        if (typeof about !== "string") {
            return res.status(400).json({ message: "Invalid about content" });
        }

        const updatedChannel = await Channel.findOneAndUpdate(
            { _id: channel_Id, user: user },
            {
                $set: {
                    about: {
                        text: about,
                        isEdited: true
                    }
                }
            },
            { new: true, runValidators: true }
        ).select("about");

        if (!updatedChannel) {
            console.log("Channel is not found");
            return res.status(404).json({ message: "Channel not found" });
        }

        res.status(200).json({ message: "About section set", about });
    } catch (err) {
        return res.status(500).json({ message: "Error updating about section" });
    }
}

// to get all the photos of the channel
const getChannelPhotos = async (req, res) => {

    const LIMIT = Number(req.query.limit) || 10;
    const SKIP = Number(req.query.skip) || 0;
    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const channel_Id = req.params?.channelId;

        if (!channel_Id) {
            return res.status(400).json({ message: "Channel id required for search" });
        }

        const channelUser = await Channel.findById(channel_Id).select("user").lean();

        if (!channelUser) {
            return res.status(404).json({ message: "Channel not found" });
        }

        const visibilityQuery = {
            $in: ["Public"]
        };
        const follow = await Follow.findOne({
            follower: user,
            following: channelUser.user
        });

        const connection = await Connections.findOne({
            $or: [
                { sender: user, receiver: channelUser.user },
                { sender: channelUser.user, receiver: user }
            ]
        });

        if (follow || connection) {
            visibilityQuery.$in.push("Network");
        }

        if (channelUser.user.toString() === user.toString()) {
            visibilityQuery.$in.push("Network");
            visibilityQuery.$in.push("Private");
            visibilityQuery.$in.push("Sheduled");
        }


        const posts = await Post.find({
            channel: channel_Id,
            media: {
                $exists: true,
                $ne: []
            },
            isDeleted: false,
            visibility: visibilityQuery
        })
            .select("media _id postedBy")
            .limit(LIMIT)
            .skip(SKIP);

        const images = posts.flatMap(post =>

            post.media
                .filter(m =>
                    !/\.(mp4|webm|ogg|mov|avi)$/i.test(m.url)
                )
                .map(m => ({
                    postId: post._id,
                    postedBy: post.postedBy,
                    allowEdit: post.postedBy.toString() === user,
                    url: m.url,
                    public_id: m.public_id
                }))
        );

        const totalPosts = await Post.countDocuments({
            channel: channel_Id,
            media: {
                $exists: true,
                $ne: []
            },
            isDeleted: false
        });

        const noMore = SKIP + posts.length >= totalPosts;
        const nextSkip = SKIP + posts.length;

        return res.status(200).json({
            message: "Success retrieving images",
            images,
            noMore,
            nextSkip
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Error fetching images",
            error: err.message
        });
    }
}

// Get channel videos
const getChannelVideos = async (req, res) => {

    const LIMIT = Number(req.query.limit) || 10;
    const SKIP = Number(req.query.skip) || 0;
    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const channel_Id = req.params?.channelId;

        if (!channel_Id) {
            return res.status(400).json({ message: "Channel id required for search" });
        }

        const channelUser = await Channel.findById(channel_Id).select("user").lean();

        if (!channelUser) {
            return res.status(404).json({ message: "Channel not found" });
        }

        const visibilityQuery = {
            $in: ["Public"]
        };
        const follow = await Follow.findOne({
            follower: user,
            following: channelUser.user
        });

        const connection = await Connections.findOne({
            $or: [
                { sender: user, receiver: channelUser.user },
                { sender: channelUser.user, receiver: user }
            ]
        });

        if (follow || connection) {
            visibilityQuery.$in.push("Network");
        }

        if (channelUser.user.toString() === user.toString()) {
            visibilityQuery.$in.push("Network");
            visibilityQuery.$in.push("Private");
            visibilityQuery.$in.push("Sheduled");
        }


        const posts = await Post.find({
            channel: channel_Id,
            media: {
                $exists: true,
                $ne: []
            },
            visibility: visibilityQuery,
            isDeleted: false
        })
            .select("media _id postedBy")
            .limit(LIMIT)
            .skip(SKIP);

        const videos = posts.flatMap(post =>

            post.media
                .filter(m =>
                    /\.(mp4|webm|ogg|mov|avi)$/i.test(m.url)
                )
                .map(m => ({
                    postId: post._id,
                    postedBy: post.postedBy,
                    allowEdit: post.postedBy.toString() === user,
                    url: m.url,
                    public_id: m.public_id
                }))
        );

        const totalPosts = await Post.countDocuments({
            channel: channel_Id,
            media: {
                $exists: true,
                $ne: []
            },
            isDeleted: false
        });

        const noMore = SKIP + posts.length >= totalPosts;
        const nextSkip = SKIP + posts.length;

        return res.status(200).json({
            message: "Success retrieving images",
            videos,
            noMore,
            nextSkip
        });

        return res.status(200).json({
            message: "Success retrieving images",
            videos,
            noMore,
            nextSkip
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Error fetching images",
            error: err.message
        });
    }
}

module.exports = { getChannel, getChannelPosts, setAbout, getChannelPhotos, getChannelVideos };