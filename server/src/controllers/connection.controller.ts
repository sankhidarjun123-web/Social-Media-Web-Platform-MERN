const mongoose = require('mongoose');
const Connections = require("../models/Connections.model");
const Notifications = require("../models/Notification.model");
const Follow = require('../models/Follow.model');
const Users = require("../models/Users.model");
import { Request, Response } from "express";
const {
    sendNotification
} = require(
    "../services/notification.services"
);


const getAllConnections = async (
    req: Request,
    res: Response
): Promise<any> => {

    const LIMIT = parseInt(req.query?.limit as string) || 10;
    const SKIP = parseInt(req.query?.skip as string) || 0;

    try {

        const currentUser = req.user?.id;

        if (!currentUser) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Fetch all connections except rejected
        const connections = await Connections.find({
            status: { $ne: "rejected" },
            $or: [
                {
                    sender: currentUser
                },
                {
                    receiver: currentUser
                }
            ]
        })
            .limit(LIMIT)
            .skip(SKIP)
            .sort({ createdAt: -1 })
            .populate(
                "sender receiver",
                "_id username firstname lastname profileImg coverImg followers followings connections channel bio location"
            )
            .lean();

        // Extract ONLY the other user
        const users = connections.map((connection: any) => {

            const isSender =
                connection.sender._id.toString() === currentUser;

            const targetUser = isSender
                ? connection.receiver
                : connection.sender;

            return {
                ...targetUser,

                connectionStatus: {
                    sender: isSender
                        ? connection.status
                        : "",

                    receiver: !isSender
                        ? connection.status
                        : ""
                }
            };
        });

        // Get user ids
        const userIds = users.map(
            (user: any) => user._id.toString()
        );

        // Fetch followed users
        const follows = await Follow.find({
            follower: currentUser,
            following: { $in: userIds }
        }).lean();

        // Convert to set
        const followedUserIds = new Set(
            follows.map((follow: any) =>
                follow.following.toString()
            )
        );

        // Add followed property
        const updatedUsers = users.map((user: any) => {

            const userId = user._id.toString();

            user.followed =
                followedUserIds.has(userId);

            return user;
        });

        // Count total
        const total = await Connections.countDocuments({
            status: { $ne: "rejected" },
            $or: [
                {
                    sender: currentUser
                },
                {
                    receiver: currentUser
                }
            ]
        });

        const noMoreData =
            SKIP + LIMIT >= total;

        return res.status(200).json({
            message: "Connections fetched successfully",

            // ONLY users array
            connectionsList: updatedUsers,

            noMoreData,
            nextSkip: SKIP + LIMIT
        });

    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const sendConnectionRequest = async (
    req: Request,
    res: Response
): Promise<any> => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const targetId = req.params?.targetId as string;

        if (!targetId) {
            return res.status(400).json({
                message: "Target id is required"
            });
        }

        if (user === targetId) {
            return res.status(409).json({
                message: "You cannot connect with yourself"
            });
        }

        // Check target user exists
        const targetUser = await Users.findById(targetId);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check existing connection
        const existingConnection = await Connections.findOne({
            $or: [
                {
                    sender: user,
                    receiver: targetId
                },
                {
                    sender: targetId,
                    receiver: user
                }
            ]
        });

        if (existingConnection) {
            return res.status(409).json({
                message: "Connection already exists"
            });
        }

        // Create connection request
        await Connections.create({
            sender: user,
            receiver: targetId,
            status: "pending"
        });

        // Send notification
        const userData = await Users.findById(user)
            .select("username profileImg");

        await sendNotification({
            receiver: [targetId],
            sender: user,
            type: "connection_request",
            link: "/network",
            image: userData?.profileImg,
            mainMessage:
                `${userData?.username} sent you a connection request`
        });

        return res.status(201).json({
            message: "Connection request sent successfully"
        });

    } catch (err: any) {

        console.error(err);

        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


// manage the accepted connection request
const acceptConnectionRequest = async (req: Request, res: Response) => {


    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const requestId = req.params?.requestId as string;

        if (!requestId) {
            return res.status(400).json({ message: "request user id is required" });
        }

        if (user === requestId) {
            return res.status(409).json({ message: "user cannot accept there own connection request" });
        }

        const connection = await Connections.findOne({
            sender: requestId,
            receiver: user,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ message: "Connection doesn't exist" });
        }

        await Users.updateOne({
            _id: user
        }, {
            $inc: { connections: 1 }
        });

        await Users.updateOne({
            _id: requestId
        }, {
            $inc: { connections: 1 }
        });

        await Connections.updateOne({
            sender: requestId,
            receiver: user,
            status: "pending"
        }, {
            $set: { status: "accepted" }
        }, { runValidators: true });
        const userData = await Users.findById(user).select("username profileImg");
        await sendNotification({
            receiver: [requestId],
            sender: user,
            type: "connection_accept",
            link: "/network",
            image: userData?.profileImg,
            mainMessage:
                `${userData?.username} accepted your connection request`
        });

        res.status(200).json({ message: "Connection request accepted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
}


// manage the rejected connection request rejected
const rejectConnectionRequest = async (req: Request, res: Response) => {

    const session = await mongoose.startSession();
    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const requestId = req.params?.requestId as string;

        if (!requestId) {
            return res.status(400).json({ message: "request user id is required" });
        }

        if (user === requestId) {
            return res.status(409).json({ message: "user cannot reject there own connection request" });
        }

        const connection = await Connections.findOne({
            sender: requestId,
            receiver: user,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ message: "Connection doesn't exist" });
        }

        await session.startTransaction();
        await Connections.updateOne({
            sender: requestId,
            receiver: user,
            status: "pending"
        }, {
            $set: { status: "rejected" }
        }, { runValidators: true, session });

        await Connections.deleteOne({
            sender: requestId,
            receiver: user,
            status: "rejected"
        }, { session });


        await session.commitTransaction();

        res.status(200).json({ message: "Connection request rejected successfully" });
    } catch (err) {

        await session.abortTransaction();
        return res.status(500).json({ message: "Server error" });
    } finally {
        session.endSession();
    }
}


// manages all the removed connections
const removeConnection = async (req: Request, res: Response) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const targetId = req.params?.targetId as string;

        if (!targetId) {
            return res.status(400).json({ message: "Target id is required" });
        }

        const connection = await Connections.findOne({
            $and: [
                {
                    $or: [
                        { status: "accepted" },
                        { status: "pending" }
                    ]
                },
                {
                    $or: [
                        {
                            sender: user,
                            receiver: targetId
                        },
                        {
                            sender: targetId,
                            receiver: user
                        }
                    ]
                }
            ]
        });

        if (!connection) {
            return res.status(409).json({ message: "Connection doesn't exist " });
        }

        if (connection.status === "accepted") {
            await Users.updateOne({
                _id: user
            }, {
                $inc: { connections: -1 }
            });

            await Users.updateOne({
                _id: targetId
            }, {
                $inc: { connections: -1 }
            });
        }

        await Connections.deleteOne({
            $and: [
                {
                    $or: [
                        { status: "accepted" },
                        { status: "pending" }
                    ]
                },
                {
                    $or: [
                        {
                            sender: user,
                            receiver: targetId
                        },
                        {
                            sender: targetId,
                            receiver: user
                        }
                    ]
                }
            ]
        });

        res.status(200).json({ message: "Connection removed successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
}


module.exports = { getAllConnections, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection };