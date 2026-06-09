const mongoose = require("mongoose");


const commentSchema = mongoose.Schema({


    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    text: {

        words: {
            type: String,
            maxlength: 1000,
            required: true,
        },

        hashtags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            }
        ]
    },

    likes: {
        type: Number,
        default: 0
    },

    childComments: {
        type: Number,
        default: 0
    },


    isDeleted: {
        type: Boolean,
        default: false
    },

    visibility: {
        type: String,
        enum: ["public", "private", "hidden"],
        default: "public"
    },

    isEdited: {
        type: Boolean,
        default: false
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    commentPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },


}, { timestamps: true });


module.exports = mongoose.model("Comment", commentSchema);