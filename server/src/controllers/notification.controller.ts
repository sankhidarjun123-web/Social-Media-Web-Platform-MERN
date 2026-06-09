const Notifications = require("../models/Notification.model");
import { Request, Response } from "express";



const getAllNotifications = async (req: Request, res: Response) => {

    const LIMIT: number = Number(req.query?.limit || 10);
    const SKIP: number = Number(req.query?.skip || 0);
    try {

        const user = req.user?.id;

        if(!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notifications = await Notifications.find({
            receiver: user
        })
        .limit(LIMIT)
        .skip(SKIP)
        .sort({ createdAt: -1 })
        .lean();


        return res.status(200).json({
            message: "Here are notifications",
            notifications,
            nextSkip: SKIP + LIMIT,
            noMore: SKIP + LIMIT >= 30
        })
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
}

const seenNotification = async (req: Request, res: Response) => {

    try {

        const user = req.user?.id;

        if(!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notificationId = req.params?.notificationId as string;

        if(!notificationId) {
            return res.status(400).json({ message: "Notification id is required" });
        }

        await Notifications.updateOne({
            _id: notificationId
        }, {
            $set: { isRead: true }
        }, {
            runValidators: true
        });

        return res.status(200).json({ message: "Notification status updated" });

    } catch(err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = { getAllNotifications, seenNotification };