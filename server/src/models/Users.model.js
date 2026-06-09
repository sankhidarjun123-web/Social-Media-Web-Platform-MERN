const mongoose = require('mongoose');
const validator = require("validator");


const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
        match: [
            /^[a-z0-9_]+$/,
            "Username can only contain lowercase letters, numbers, and underscores (no spaces)"
        ]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email address"
        },
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        select: false,
        default: null
    },

    phone: {
        type: String,
        trim: true,
        match: [/^\+[1-9]\d{1,14}$/, "Invalid phone number"]
    },

    googleId: {
        type: String
    },

    role: {
        type: String,
        enum: ["user", "admin", "moderator", "super admin"],
        default: "user"
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    allowConnections: {
        type: Boolean,
        default: true
    },

    lastLogin: Date,
    loggedOut: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: Date,

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel"
    },

    // Profile Information
    isProfileCompleted: {
        type: Boolean,
        required: true,
        default: false
    },

    firstname: {
        type: String,
        match: [
            /^[a-zA-Z0-9]+$/,
            "First name should only contain letters and numbers"
        ]
    },
    lastname: {
        type: String,
        match: [
            /^[a-zA-Z0-9]+$/,
            "Last name should only contain letters and numbers"
        ]
    },
    profileImg: String,
    coverImg: String,
    websites: [String],
    location: {
        city: String,
        state: String,
        country: String
    },
    bio: {
        type: String,
        maxlength: 101
    },

    interests: [String],

    searches: {
        type: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        validate: {
            validator: arr => arr.length <= 30,
            message: "Maximum 30 searches allowed"
        },

        default: []
    },

    visitedUsers: {

        type: [{
            visitedUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
                required: true
            },

            visitedUserUsername: String,
            visitedUserFirstname: String,
            visitedUserLastname: String,
            visitedUserProfileImg: String,
            visitedUserChannel: String
        }],

        default: [],

        validate: {
            validator: (arr) => arr.length <= 5,
            message: "Maximum 5 visited users allowed"
        }
    },

    DOB: Date,

    followers: {
        type: Number,
        default: 0
    },

    followings: {
        type: Number,
        default: 0
    },

    connections: {
        type: Number,
        default: 0
    },

    allowNotifications: {
        type: Boolean,
        default: true,
    },

    allowChats: {
        type: Boolean,
        default: true
    },

    isEdited: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    isOnline: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String,
        default: null
    },

    verificationTokenExpires: {
        type: Date,
        default: null
    },

    lastseen: Date
}, { timestamps: true }
);

const UserModel = mongoose.model("Users", userSchema);

module.exports = UserModel;