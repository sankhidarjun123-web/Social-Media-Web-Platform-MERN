const express = require('express');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login, logout, verifyEmail } = require('../controllers/auth.controller');
const Users = require("../models/Users.model");
const Channel = require("../models/Channel.model");
const auth = require("../middlewares/authMiddleware");
const { changeOrSetPassword, deleteUser, changeUsername, changeOrSetPhone, privacySettings } = require('../controllers/settings.controller');

const router = express.Router();

router.get("/status-check", auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id)
        .select("username email DOB firstname lastname allowChats allowNotifications allowConnections googleId phone profileImg coverImg role isProfileCompleted channel bio followers followings connections location websites visitedUsers searches isVerified")
        .lean();

        const channelSettings = await Channel.findById(user?.channel).select("visibility contentVisibility").lean();
        const userPassword = await Users.findById(req.user.id).select("password").lean();

        if(userPassword.password) {
            user.hasPassword = true;
        } else {
            user.hasPassword = false;
        }

        user.channelVisibility = channelSettings?.visibility;
        user.channelContentVisibility = channelSettings?.contentVisibility;

        if (!user) {
            console.log("Unauthorized");
            return res.status(401).json({
                message: "Unauthorized",
                authStatus: false,
                user: null,
                isProfileCompleted: false
            });
        }
        return res.status(200).json({
            message: "User verified",
            authStatus: true,
            user,
            isProfileCompleted: user.isProfileCompleted,
            isVerified: user.isVerified
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            message: "Server error",
            authStatus: false,
            user: null,
            isProfileCompleted: false
        });
    }
});

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);


router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {

        const token = jwt.sign(
            { id: req.user._id, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // true in production (HTTPS)
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.CLIENT_URL}/profile?from=google`);
    }
)

router.get("/verify-email/:token", verifyEmail);

router.patch("/password", auth, changeOrSetPassword);

router.patch("/change-username", auth, changeUsername);

router.patch("/phone", auth, changeOrSetPhone);

router.patch("/privacy-settings", auth, privacySettings);

router.delete("/delete-account", auth, deleteUser);

module.exports = router;