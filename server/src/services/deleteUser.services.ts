import AppError from "../utils/AppError";
const mongoose = require("mongoose");
const Users = require("../models/Users.model");
const Channel = require("../models/Channel.model");
const Chats = require("../models/Chats.model");
const Connections = require("../models/Connections.model");
const Comment = require("../models/Comment.model");
const Like = require("../models/Like.model");
const Follow = require("../models/Follow.model");
const Notification = require("../models/Notification.model");
const Post = require("../models/Post.model");
const View = require('../models/View.model');
const { deleteFromGCS } = require("../utils/gcsServices");
import messageDeleter from "./deleteMessage.services";



const userDeleter = async (userId: string): Promise<boolean> => {

    const session = await mongoose.startSession();
    try {
        if (!userId) {
            throw new AppError("User id is required for deletion", 400);
        }


        session.startTransaction();


        //------------------------------------------------------------------
        // Deletion of all the likes on the post by the user
        // and decrementing the like count of the post by 1 for each like
        //------------------------------------------------------------------

        const likedPosts = await Like.find({
            likedBy: userId
        }).select("likedPost").session(session);

        const likedPostIds = likedPosts.map((like: any) => like.likedPost);

        await Promise.all(
            likedPostIds.map((postId: string) => {
                return Post.updateOne(
                    {
                        _id: postId
                    },
                    {
                        $inc: {
                            likes: -1
                        }
                    },
                    {
                        session
                    }
                )
            })
        )

        await Like.deleteMany({
            likedBy: userId
        }, {
            session
        });


        //------------------------------------------------------------------
        // Deletion of all the views on the post by the user
        // and decrementing the view count of the post by 1 for each view
        //------------------------------------------------------------------

        const viewPosts = await View.find({
            viewedBy: userId
        }).select("viewedPost").session(session);


        const viewedPostIds = viewPosts.map((view: any) => view.viewedPost);

        await Promise.all(
            viewedPostIds.map((postId: string) => {
                return Post.updateOne({
                    _id: postId
                }, {
                    $inc: {
                        views: -1
                    }
                }, {
                    session
                });
            })
        );

        await View.deleteMany({
            viewedBy: userId
        }, {
            session
        });


        //------------------------------------------------------------------
        // Deletion of all the comments by the user
        // and decrementing the comment count of the post by 1 for each comment
        //------------------------------------------------------------------

        const commentStats = await Comment.aggregate([
            {
                $match: {
                    postedBy: userId
                }
            },
            {
                $group: {
                    _id: "$commentPost",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]).session(session);

        await Promise.all(
            commentStats.map((stat: any) =>
                Post.updateOne(
                    {
                        _id: stat._id
                    },
                    {
                        $inc: {
                            comments: -stat.count
                        }
                    },
                    {
                        session
                    }
                )
            )
        );

        await Comment.deleteMany(
            {
                postedBy: userId
            },
            {
                session
            }
        );

        //------------------------------------------------------------------
        // Deletion of all the connections of the user and 
        // decrementing the connection count of the connected users by 1
        //------------------------------------------------------------------

        const connectedUsers = await Connections.find({
            $or: [{
                sender: userId,
            }, {
                receiver: userId,
            }]

        }).select("sender receiver").session(session);

        const connectedUserIds = connectedUsers.map((connection: any) => {
            if (connection.sender.toString() === userId) {
                return connection.receiver.toString();
            } else {
                return connection.sender.toString();
            }
        });

        await Promise.all(
            connectedUserIds.map((id: string) =>
                Users.updateOne(
                    {
                        _id: id
                    },
                    {
                        $inc: {
                            connections: -1
                        }
                    },
                    {
                        session
                    }
                )
            )
        );

        await Connections.deleteMany({
            $or: [{
                sender: userId,
            }, {
                receiver: userId,
            }]
        }, {
            session
        });

        //------------------------------------------------------------------
        // Deletion of all the followers and followings created by the user
        //------------------------------------------------------------------

        const follows = await Follow.find({
            $or: [
                { follower: userId },
                { following: userId }
            ]
        })
            .select("follower following")
            .session(session);

        await Promise.all(
            follows.map((follow: any) => {
                if (follow.follower.toString() === userId) {
                    // user follows someone
                    return Users.updateOne(
                        { _id: follow.following },
                        {
                            $inc: {
                                followers: -1
                            }
                        },
                        { session }
                    );
                }

                // someone follows user
                return Users.updateOne(
                    { _id: follow.follower },
                    {
                        $inc: {
                            following: -1
                        }
                    },
                    { session }
                );
            })
        );

        await Follow.deleteMany({
            $or: [
                { follower: userId },
                { following: userId }
            ]
        }, {
            session
        });

        //------------------------------------------------------------------
        // Deletion of all the notifications for the user
        //------------------------------------------------------------------

        await Notification.updateMany(
            { receiver: userId },
            { $pull: { receiver: userId } },
            { session }
        );

        await Notification.deleteMany(
            { receiver: { $size: 0 } },
            { session }
        );

        //------------------------------------------------------------------
        // Deletion of all the posts by the user and all the associated data with the post
        //------------------------------------------------------------------

        const userPosts = await Post.find({
            postedBy: userId
        }).select("_id media").session(session);


        await Promise.all(
            userPosts.map(async (post: any) => {
                if (post.media?.length) {
                    await Promise.all(
                        post.media.map((m: any) =>
                            deleteFromGCS(m.url, m.type)
                        )
                    );
                }

                await Promise.all([
                    Like.deleteMany(
                        { likedPost: post._id },
                        { session }
                    ),
                    Comment.deleteMany(
                        { commentPost: post._id },
                        { session }
                    ),
                    View.deleteMany(
                        { viewedPost: post._id },
                        { session }
                    )
                ]);
            })
        );

        await Post.deleteMany({
            postedBy: userId
        }, {
            session
        });

        //------------------------------------------------------------------
        // Deletion of all the chats and 
        // messages by the user and all the associated data with the message
        //------------------------------------------------------------------


        const userChats = await Chats.find({
            participants: userId
        }).select("_id").session(session);

        await Promise.all(
            userChats.map(async (chat: any) => {
                await messageDeleter(null, chat._id);
            })
        );

        await Chats.deleteMany({
            participants: userId
        }, {
            session
        });

        //------------------------------------------------------------------
        // Deletion of channel created for the user
        //------------------------------------------------------------------

        await Channel.deleteOne({
            user: userId
        }, {
            session
        });

        //------------------------------------------------------------------
        // Finally, deletion of the user
        //------------------------------------------------------------------

        const userProfile = await Users.findById(userId).select("profileImg coverImg").session(session);

        await Promise.all([
            deleteFromGCS(userProfile.profileImg, "image"),
            deleteFromGCS(userProfile.coverImg, "image")
        ])

        await Users.deleteOne({
            _id: userId
        }, {
            session
        });

        await session.commitTransaction();
        return true;

    } catch (err) {
        await session.abortTransaction();
        return false;
    } finally {
        session.endSession();
    }
}


export default userDeleter;