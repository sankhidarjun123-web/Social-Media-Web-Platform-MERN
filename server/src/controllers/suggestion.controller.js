const express = require('express');
const mongoose = require("mongoose");
const Users = require("../models/Users.model");
const Follow = require("../models/Follow.model");
const Connections = require("../models/Connections.model");
import { userRanking } from '../services/feedRanking.services';

const router = express.Router();

const getUserSuggestion = async (req, res) => {

    const LIMIT = parseInt(req.query?.limit) || 20;
    const SKIP = parseInt(req.query?.skip) || 0;

    try {

        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = new mongoose.Types.ObjectId(req.user.id);

        const followers = await Follow.find({ follower: user })
            .select("following")
            .lean();

        const followerIds = followers.map(f => f.following);

        const connections = await Connections.find({ user: user })
            .select("sender")
            .lean();

        const connectionIds = connections.map(c => c.sender);

        const notToInclude = [
            user,
            ...followerIds,
            ...connectionIds
        ];

        const suggestions = await Users.aggregate([
            {
                $match: {
                    _id: { $nin: notToInclude }
                }
            },
            {
                $lookup: {
                    from: "channels",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelInfo"
                }
            },
            {
                $unwind: "$channelInfo"
            },
            {
                $match: {
                    "channelInfo.visibility": "public"
                }
            },
            {
                $skip: SKIP
            },
            {
                $limit: LIMIT
            },
            {
                $project: {
                    username: 1,
                    firstname: 1,
                    lastname: 1,
                    profileImg: 1,
                    coverImg: 1,
                    followers: 1,
                    followings: 1,
                    connections: 1,
                    channel: 1,
                    bio: 1,
                    location: 1,
                    _id: 1
                }
            }
        ]);

        const rankedSuggestions = await Promise.all(
            suggestions.map(async (candidate) => ({
                ...candidate,
                score: await userRanking(candidate, req.user.id)
            }))
        );

        rankedSuggestions.sort(
            (a, b) => b.score - a.score
        );

        const updatedSuggestion = rankedSuggestions.map(user => ({
            ...user,
            followed: false,
            connectionStatus: {
                sender: "",
                receiver: ""
            }
        }));

        const avaliableUsers = await Users.countDocuments({
            _id: { $nin: notToInclude }
        });

        res.status(200).json({
            message: "Connection retrieved",
            noMoreSuggestions: avaliableUsers <= LIMIT + SKIP,
            nextSkip: LIMIT + SKIP,
            suggestions: updatedSuggestion
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error retrieving suggestions"
        });
    }
}

module.exports = { getUserSuggestion };