const mongoose = require('mongoose');

const followSchema = mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        validate: {
            validator: function(value) {
                return value.toString() !== this.follower.toString();
            },

            message: "User cannot follow themselves"
        }
    }
    
}, { timestamps: true });

followSchema.index(
    { follower: 1, following: 1 },
    { unique: true }
);


module.exports = mongoose.model("Follow", followSchema);