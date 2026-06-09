const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({

    on: {
        type: String,
        enum: ["post", "comment"],
        required: true
    },

    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    postLiked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: function () {
            return this.on === "post";
        },
        default: null
    },

    postUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: function () {
            return this.on === "post";
        },
        default: null
    },

    commentLiked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: function () {
            return this.on === "comment";
        },
        default: null
    },

    commentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: function () {
            return this.on === "comment";
        },
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model("Like", likeSchema);
