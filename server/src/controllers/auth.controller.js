const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/Users.model');
const Channel = require('../models/Channel.model');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('node:events');
const validator = require("validator");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/sendEmail");
import { registeringUsers } from "../socket/onlineUsers";
const { getIO } = require("../socket/socket");

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
}

// Register a new user

const register = async (req, res) => {
    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const usernameRegex = /^[a-z0-9_]+$/;

        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message:
                    "Username can only contain lowercase letters, numbers and underscores"
            });
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
            });
        }

        const existingUser = await Users.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "User with given email or username already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // token user receives in email
        const rawToken =
            crypto.randomBytes(32).toString("hex");

        // token stored in DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const user = await Users.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "user",

            isVerified: false,

            verificationToken: hashedToken,

            verificationTokenExpires:
                Date.now() + 24 * 60 * 60 * 1000
        });

        const verificationLink =
            `${process.env.SERVER_URL}/auth/verify-email/${rawToken}`;

        await sendVerificationEmail(
            email,
            verificationLink
        );

        return res.status(201).json({
            message:
                "Registration successful. Please verify your email."
        });

    } catch (error) {

        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "User with given email or username already exists"
            });
        }

        return res.status(500).json({
            message: "Error creating user"
        });
    }
};

// Login an existing user
const login = async (req, res) => {

    try {
        const body = req.body;

        if (!body.email || !body.password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (typeof req.body.email !== "string") {
            return res.status(400).json({
                message: "Email must be a string"
            });
        }


        const email = req.body.email.toLowerCase();
        const user = await Users.findOne({ email }).select("+password");

        if (!user) {
            console.log("Invalid credentials");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please continue with Google."
            });
        }


        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        if (!user.isVerified) {

            try {
                const rawToken =
                    crypto.randomBytes(32).toString("hex");

                // token stored in DB
                const hashedToken = crypto
                    .createHash("sha256")
                    .update(rawToken)
                    .digest("hex");

                user.verificationToken = hashedToken,

                    user.verificationTokenExpires =
                    Date.now() + 24 * 60 * 60 * 1000

                await user.save();

                const verificationLink =
                    `${process.env.SERVER_URL}/auth/verify-email/${rawToken}`;

                await sendVerificationEmail(
                    email,
                    verificationLink
                );

                return res.status(200).json({
                    message:
                        "Login successful. Please verify your email."
                });

            } catch (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Login failed internal sever error"
                });
            }
        }

        const passwordCheck = await bcrypt.compare(body.password, user.password);

        if (!passwordCheck) {
            console.log("Invalid credentials")
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,        // true in production (HTTPS)
            sameSite: "None",  // or "Lax"
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "connection successful",
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error validating the user" });
    }
}


const verifyEmail = async (req, res) => {

    const io = getIO();

    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await Users.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired token"
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    console.log(user.email.toString());
    const registeringUser = registeringUsers.get(user.email.toString());

    if (registeringUser) {

        io.to(
            registeringUser.socketId
        ).emit(
            "registration-successful",
            {
                success: true
            }
        )
    }

    registeringUsers.delete(user.email.toString());

    res.redirect(`${process.env.CLIENT_URL}/profile`);
};

const logout = async (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });

    res.status(200).json({ message: "The user has successfully loggedout" });
}

module.exports = { register, login, logout, verifyEmail };