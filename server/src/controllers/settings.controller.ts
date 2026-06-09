import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import userDeleter from "../services/deleteUser.services";
const Users = require('../models/Users.model');
const Channel = require('../models/Channel.model');
const bcrypt = require('bcryptjs');



// Edit or set password for the users
const changeOrSetPassword = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { newPassword, previousPassword } = req.body;

        const currentUser = await Users.findById(user).select("password");

        if (!currentUser) {
            return next(new AppError("User not found", 404));
        }
        if (currentUser.password) {
            if (!previousPassword) {
                return next(new AppError("Previous password is required for verification", 400));
            }

            const isMatch = await bcrypt.compare(
                previousPassword,
                currentUser.password
            )

            if (!isMatch) {
                return next(new AppError("Sorry password didn't match", 400));
            }
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return next(new AppError(
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
                400)
            );
        }

        const updatedPassword = await bcrypt.hash(newPassword, 10);
        await Users.updateOne({
            _id: user
        }, {
            password: updatedPassword
        }, {
            runValidators: true
        });

        return res.status(200).json({ message: "Password set successfully " });
    } catch (err) {
        console.error(err);
        return next(new AppError("Internal server error", 500));
    }
}

const changeUsername = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { username } = req.body;

        if (!username) {
            return next(new AppError("Username is required", 400));
        }

        const usernameRegex = /^[a-z0-9_]+$/;

        if (!usernameRegex.test(username)) {
            return next(new AppError(
                "Username can only contain lowercase letters, numbers, and underscores (no spaces)"
                , 400));
        }

        const existingUser = await Users.findOne({ username });

        if (existingUser) {
            return next(new AppError("Username already exists", 400));
        }

        await Users.updateOne({
            _id: user
        }, {
            $set: { username: username }
        }, {
            runValidators: true
        });

        res.status(200).json({ message: "Username changed successfully" });

    } catch (err) {
        return next(new AppError("Internal server error", 500));
    }
}


const changeOrSetPhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { phone } = req.body;

        if (!phone) {
            return next(
                new AppError("Phone number is required", 400)
            );
        }

        // E.164 format validation (+919876543210)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;

        if (!phoneRegex.test(phone)) {
            return next(
                new AppError("Invalid phone number", 400)
            );
        }

        const existingUser = await Users.findOne({
            phone: phone,
            _id: { $ne: user }
        });

        if (existingUser) {
            return next(
                new AppError(
                    "Phone number already in use",
                    409
                )
            );
        }

        const updatedUser = await Users.findByIdAndUpdate(
            user,
            {
                $set: {
                    phone: phone
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return next(
                new AppError("User not found", 404)
            );
        }

        return res.status(200).json({
            message: "Phone number updated successfully",
            phoneNumber: updatedUser.phone
        });

    } catch (err) {
        next(new AppError("Internal server error", 500));
    }
};


const deleteUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }

        const password = req.body.password;
        const isGoogleUser = req.body.isGoogleUser;

        if (!password && !isGoogleUser) return res.status(400).json({ message: "Password is required" });

        const currentUser = await Users.findById(user).select("password");

        if (!currentUser) {
            return next(new AppError("User not found", 404));
        }

        if (!isGoogleUser) {
            const isMatch = await bcrypt.compare(
                password,
                currentUser.password
            );

            if (!isMatch) {
                return next(new AppError("Invalid password", 400));
            }
        }

        const deleted = await userDeleter(user);

        if (!deleted) {
            return next(new AppError("Failed to delete user", 500));
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return next(new AppError("Internal server error", 500));
    }
}


const privacySettings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const userEdit: any = {};
    const channelEdit: any = {};

    const visibilityFields = ["private", "public", "protected"];
    try {

        const user = req.user?.id;

        if (!user) {
            return next(new AppError("Unauthorized", 401));
        }
        const { allowNotifications, allowChats, allowConnections, channelVisibility, channelContentVisibility } = req.body;

        if (allowNotifications != null) {
            userEdit.allowNotifications = allowNotifications;
        }

        if (allowChats != null) {
            userEdit.allowChats = allowChats;
        }

        if (allowConnections != null) {
            userEdit.allowConnections = allowConnections;
        }

        if (channelVisibility) {
            if (!visibilityFields.includes(channelVisibility)) {
                return next(new AppError("Invalid Visibility field", 400));
            }

            channelEdit.visibility = channelVisibility;
        }

        if (channelContentVisibility) {
            if (!visibilityFields.includes(channelContentVisibility)) {
                return next(new AppError("Invalid Visibility field", 400));
            }

            channelEdit.contentVisibility = channelContentVisibility;
        }

        await Users.updateOne({
            _id: user
        }, userEdit, {
            runValidators: true
        });


        await Channel.updateOne({
            user: user
        }, channelEdit, {
            runValidators: true
        });


        return res.status(200).json({ message: "Privacy setting updated successfully" });


    } catch (err) {
        console.error(err);
        return next(new AppError("Internal Server error", 500));
    }
}


module.exports = {
    changeOrSetPassword,
    deleteUser,
    changeUsername,
    changeOrSetPhone,
    privacySettings
}
