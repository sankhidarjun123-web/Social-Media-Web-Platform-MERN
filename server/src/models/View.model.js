const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    viewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    }
}, { timestamps: true });

// Unique view per user per post
viewSchema.index({ post: 1, viewedBy: 1 }, { unique: true });

// Optional performance index
viewSchema.index({ post: 1 });

module.exports = mongoose.model("View", viewSchema);