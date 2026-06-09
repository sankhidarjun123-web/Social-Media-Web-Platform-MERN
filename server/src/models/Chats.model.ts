const mongoose = require('mongoose');


const chatSchema = mongoose.Schema({

    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        }],

        validate: {
            validator: function (participants: any) {

                return (
                    participants.length === 2 &&
                    participants[0].toString() !==
                    participants[1].toString()
                );

            },

            message:
                "Chat must contain exactly 2 unique participants"
        },

        required: true
    },

    encryptedChatKey: {
        type: String,
        required: true
    },

    keyIV: {
        type: String,
        required: true
    },
    
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages"
    }
}, { timestamps: true });

module.exports = mongoose.model("Chats", chatSchema);