import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
const Channel = require("../models/Channel.model");
const Follow = require("../models/Follow.model");
const Connection = require("../models/Connections.model");
const Users = require("../models/Users.model");

// For channel visibility
const channelVisibility = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { channelId } = req.params;

        if (!channelId) {
            return next(new AppError("Channel Id is required", 400));
        }

        const channelOwner = await Users.findOne({
            channel: channelId
        }).select("_id");

        const channelInfo = await Channel.findById(channelId).select("visibility").lean();

        if (!channelInfo) {
            return next(new AppError("Channel not found", 404));
        }

        if (channelInfo?.visibility === "private" && user !== channelOwner?._id.toString()) {
            return next(new AppError("Forbidden", 403));
        }

        if (channelInfo?.visibility === "protected") {
            const isFollower = await Follow.exists({
                following: channelOwner._id.toString(),
                follower: user
            });

            const isConnected = await Connection.exists({
                $or: [{
                    sender: channelOwner._id.toString(),
                    receiver: user
                }, {
                    receiver: channelOwner._id.toString(),
                    sender: user
                }],
                status: "accepted"
            });

            if (!isFollower && !isConnected && user !== channelOwner?._id.toString()) {
                return next(new AppError("Forbidden", 403));
            }
        }

        req.channelVisibility = channelInfo.visibility;
        next();
    } catch (err) {
        return next(new AppError("Internal Server Error", 500));
    }
}


// For channel content visibility
const channelContentVisibility = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { channelId } = req.params;

        if (!channelId) {
            return next(new AppError("Channel Id is required", 400));
        }

        const channelOwner = await Users.findOne({
            channel: channelId
        }).select("_id");

        const channelInfo = await Channel.findById(channelId).select("contentVisibility").lean();

        if (!channelInfo) {
            return next(new AppError("Channel not found", 404));
        }

        if (channelInfo?.contentVisibility === "private" && user !== channelOwner?._id.toString()) {
            return next(new AppError("Forbidden", 403));
        }

        if (channelInfo?.contentVisibility === "protected") {
            const isFollower = await Follow.exists({
                following: channelOwner._id.toString(),
                follower: user
            });

            const isConnected = await Connection.exists({
                $or: [{
                    sender: channelOwner._id.toString(),
                    receiver: user
                }, {
                    receiver: channelOwner._id.toString(),
                    sender: user
                }],
                status: "accepted"
            });

            if (!isFollower && !isConnected && user !== channelOwner?._id.toString()) {
                return next(new AppError("Forbidden", 403));
            }
        }

        req.channelContentVisibility = channelInfo.contentVisibility;
        next();
    } catch (err) {
        return next(new AppError("Internal Server Error", 500));
    }
}

module.exports = { channelVisibility, channelContentVisibility };