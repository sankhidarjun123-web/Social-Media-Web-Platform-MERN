const mongoose = require('mongoose');


const searchSchema = mongoose.Schema({


    search: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },

    searchCount: {
        type: Number,
        default: 1
    }

}, { timestamps: true });


module.exports = mongoose.model("Search", searchSchema);