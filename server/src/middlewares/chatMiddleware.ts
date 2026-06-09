const Chats = require("../models/Chats.model");
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";



const chatMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthroized", 401));
        }

        const chatId = req.params?.chatId as string;

        if (!chatId) {
            req.chat = null;
            return next();
        }

        const chat = await Chats.findById(chatId).lean();

        if (!chat) {
            return next(new AppError("Chat not found", 404));
        }

        const isParticipant = chat.participants.some(
            (participant: any) => participant.toString() === user.toString()
        );

        if (!isParticipant) {
            return next(new AppError("Forbidden", 403));
        }

        req.chat = chat;
        req.receiverId = chat.participants.find(
            (participant: any) => participant.toString() !== user.toString()
        )?.toString();
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = chatMiddleware;