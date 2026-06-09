const mongoose = require('mongoose');


const postSchema = mongoose.Schema({

    post_id: {
        type: String,
        required: true,
        unique: true
    },

    topic: {
        type: [String],
        required: true,
        default: []
    },

    text: {
        words: {
            type: String,
            required: true,
            maxlength: 10000
        },

        hashtags: {
            type: [String],
            default: []
        },

        mentions: {
            type: [String],
            default: []
        }
    },

    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        index: true,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        index: true,
        required: true
    },

    location: {
        type: String
    },

    media : [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true,
                enum: ["image", "video"]
            }
        }
    ],

    likes: {
        type: Number,
        default: 0
    },

    comments: {
        type: Number,
        default: 0
    },

    views: {
        type: Number,
        default: 0
    },

    shares: {
        type: Number,
        default: 0
    },

    visibility: {
        type: String,
        enum: ["Private", "Public", "Network", "Sheduled"],
        default: "Public"
    },

    isEdited: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


module.exports = mongoose.model("Post", postSchema);