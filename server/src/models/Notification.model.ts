const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({

    receiver: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }],

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    mainMessage: {
        type: String,
        required: true
    },

    notMessage: {
        type: String
    },

    image: {
        type: String
    },

    type: {
        type: String,
        enum: [
            "like",
            "post",
            "comment",
            "reply",
            "follow",
            "connection_request",
            "connection_accept",
            "message"
        ],
        required: true
    },

    link: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });



module.exports = mongoose.model("Notifications", notificationSchema);