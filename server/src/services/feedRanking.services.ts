const Posts = require("../models/Post.model");
const Like = require("../models/Like.model");
const Comment = require("../models/Comment.model");
const Follow = require("../models/Follow.model");
const Connection = require("../models/Connections.model");
const Users = require("../models/Users.model");
const View = require("../models/View.model");
import ConnectionsModel from "../models/Connections.model";
import AppError from "../utils/AppError";




export const postRanking = async (post: any, userId: string): Promise<number> => {

    let score = 0;            // the main score for ranking a post

    try {
        const user = await Users.findById(post?.postedBy)
            .select("connections followers followings _id")
            .lean();


        if (!user) {
            throw new AppError("User does not exists", 404);
        }

        score += Math.min(user?.connections * 2, 40);
        // is user connected
        const connected = await Connection.findOne({
            $or: [
                {
                    sender: userId,
                    receiver: user?._id
                }, {
                    sender: user?._id,
                    receiver: userId
                }
            ],
            status: "accepted"
        })

        if (connected) score += 100;

        // is user following
        const following = await Follow.findOne({
            follower: userId,
            following: user?._id
        })

        if (following) score += 50;

        const hoursOld =
            (Date.now() - new Date(post.createdAt as string).getTime()) /
            (1000 * 60 * 60);

        score += 200 / (1 + hoursOld);

        score += post.likes * 2;
        score += post.comments * 5;

        // Logarithmic views
        score += Math.log10(post.views + 1) * 10;

        const liked = await Like.findOne({
            on: "post",
            likedBy: userId,
            postLiked: post?._id
        });              // if user has liked the post

        const commented = await Comment.findOne({
            postedBy: userId,
            commentPost: post?._id
        });              // if user has commented on the post


        const viewed = await View.findOne({
            post: post?._id,
            viewedBy: userId
        });             // if user has viewed the post


        if (viewed)
            score *= 0.8;

        if (liked)
            score *= 0.6;

        if (commented)
            score *= 0.5;
    } catch (err) {
        throw new AppError("Internal server error", 500);
    }

    return score;
}


export const userRanking = async (userData: any, userId: string): Promise<number> => {

    let score = 0;

    try {

        // Current user mutual connections
        const currentConnections = await Connection.find({
            $or: [{
                sender: userId
            }, {
                receiver: userId
            }],
            status: "accepted"
        }).lean();

        const cCIds = currentConnections.map((cc: any) => (

            cc.sender === userId ? cc.receiver : cc.sender
        ));

        // fetched user mutual connections
        const candidateConnections = await Connection.find({
            $or: [{
                sender: userData._id
            }, {
                receiver: userData._id
            }],
            status: "accepted"
        }).lean();

        const caCIds = candidateConnections.map((cac: any) => (
            cac.sender === userData._id ? cac.receiver : cac.sender
        ));

        const candidateSet = new Set(caCIds);

        const mutualCount = cCIds.filter((id: any) =>
            candidateSet.has(id)
        ).length;

        score += Math.min(mutualCount * 10, 200);


        score += Math.log10(userData?.connections + 1) * 20;

        // Audience size
        score += Math.log10(userData?.followers + 1) * 15;


    } catch (err) {

        throw new AppError("Internal server error", 500);
    }

    return score;
} 