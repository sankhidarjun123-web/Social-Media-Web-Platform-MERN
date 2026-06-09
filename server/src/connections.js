const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully", conn.connection.host);
    }catch(error) {
        console.error("An error occured while connecting : ", error.message);
    }
}

module.exports = connectDB;