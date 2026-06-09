const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chats",
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    contentType: {
        type: String,

        enum: [
            "text",
            "image",
            "video"
        ],

        required: true
    },

    encryptedMessage: {
        type: String,
        maxLength: 10000,
        default: ""
    },

    iv: {
        type: String,
        required: function(this: any) {
            return !!this.encryptedMessage;
        }
    },

    authTag: {
        type: String,
        required: function(this: any) {
            return !!this.encryptedMessage;
        }
    },

    media: {
        public_id: {
            type: String
        },

        type: {
            type: String,
            enum: ["image", "video"]
        }
    },

    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Messages",
    messageSchema
);