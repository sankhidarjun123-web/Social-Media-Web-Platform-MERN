require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const userAuth = require("./routes/auth.route");
const channel = require("./routes/channel.route");
const chats = require("./routes/chat.route");
const search = require("./routes/search.route");
const post = require("./routes/post.route");
const notification = require("./routes/notification.route");
const user = require("./routes/network.route");
const profile = require("./routes/profile.route");
const errorMiddleware = require("./middlewares/errorMiddleware");
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require("./connections");
const passport = require("passport");
require("./config/passport");
const cookieParser = require("cookie-parser");
const auth = require("./middlewares/authMiddleware");
const helmet = require('helmet');
const suggest = require('./routes/suggestion.route');
const onlineUsers = require('./socket/onlineUsers');
import publishScheduledPosts from './services/sheduledPost.services';
const { Server } = require('socket.io');

const feed = require("./routes/feed.route");
const {
  initSocket
} = require("./socket/socket");
const registerSocket = require("./socket/index");

const app = express();
const PORT = 2000;

let server;

if (process.env.NODE_ENV === "production") {
  server = require("http").createServer(app);
} else {
  server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, "..", "cert", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "..", "cert", "cert.pem"))
  }, app);
}

connectDB();


app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors({
  origin: ["https://localhost:5174", "https://localhost:5173"], // EXACT frontend origin
  credentials: true
}));

const io = initSocket(server);
registerSocket(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/auth", userAuth);

app.use("/channel", channel);

app.use("/userMedia", auth, post);

app.use("/network", auth, user);

app.use("/feed", feed);

app.use("/profile", auth, profile);

app.use("/suggestion", auth, suggest);

app.use("/search", auth, search);

app.use("/notifications", auth, notification);

app.use("/chats", auth, chats);
io.on("connection", (socket) => {
  console.log("User connected : ", socket.id);
  console.log(onlineUsers);

  socket.on("disconnect", () => {
    console.log("User disconnected! ", socket.id);
  });
});

app.use(errorMiddleware);

publishScheduledPosts();

server.listen(PORT, () => {
  console.log(`Server Running at https://localhost:${PORT}`)
});