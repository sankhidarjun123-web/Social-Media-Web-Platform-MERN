const Users = require("../models/Users.model");
import AppError from "../utils/AppError";
import { Request, Response, NextFunction } from "express";




const allowChats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const user = req.user?.id;

        if(!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const receiverId = (req.receiverId || req.body.receiverId) as string;

        if(!receiverId) {
            return next(new AppError("Receiver Id is required", 400));
        }

        const targetInfo = await Users.findById(receiverId).select("allowChats").lean();

        if(!targetInfo?.allowChats) {
            return res.status(403).json({ message: "The user of this account don't accept messages" });
        }

        req.allowChats = targetInfo?.allowChats as boolean;

        next();
    } catch (err) {
        return next(new AppError("Internal server error", 500));
    }
}

module.exports = allowChats;