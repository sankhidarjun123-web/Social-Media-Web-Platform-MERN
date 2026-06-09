const mongoose = require('mongoose');

const connectionsSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Connections", connectionsSchema);

