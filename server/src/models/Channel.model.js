const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({

    channel_id: {
        type: String,
        required: true,
        unique: true
    },

    visibility: {
        type: String,
        enum: ["public", "private", "protected"],
        default: "public",
        required: true
    },

    contentVisibility: {
        type: String,
        enum: ["public", "private", "protected"],
        default: "public",
        required: true
    },

    allowComments: {
        type: Boolean,
        default: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        unique: true // one channel per user
    },

    name: {
        username: {
            type: String,
            required: true
        },
        firstname: {
            type: String,
            required: true
        },
        lastname: String
    },

    postsCount: {
        type: Number,
        default: 0
    },

    playlists: {
        type: Number,
        default: 0
    },

    about: {
        text: {
            type: String,
            default: "",
            maxlength: 1000
        },
        isEdited: {
            type: Boolean,
            default: false
        }
    },

    moreInfo: {
        items: [{
            type: String,
            maxlength: 50
        }],
        isEdited: {
            type: Boolean,
            default: false
        }
    },

    links: [{
        label: String,
        url: String
    }]

}, { timestamps: true });

module.exports = mongoose.model("Channel", ChannelSchema);