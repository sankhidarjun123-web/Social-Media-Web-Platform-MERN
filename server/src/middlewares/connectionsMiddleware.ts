const Users = require("../models/Users.model");
import { Request, Response, NextFunction } from "express";


const allowConnections = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const user = req.user?.id;

        if(!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const targetId = req.params?.targetId as string;

        if(!targetId) {
            return res.status(400).json({ message: "Target id not provided" });
        }

        const targetInfo = await Users.findById(targetId).select("allowConnections").lean();

        if(!targetInfo?.allowConnections) {
            return res.status(403).json({ message: "The user of this account don't accept connections" });
        }

        req.allowConnections = targetInfo?.allowConnections as boolean;

        next();
    } catch(err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = allowConnections;