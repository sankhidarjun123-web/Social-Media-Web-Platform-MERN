const express = require('express');
const upload = require("../middlewares/uploadMiddleware");
const { sendMessage, getUserChats, getChatMessages, deleteAMessage, deleteChat, getChat } = require("../controllers/chats.controller");
const chatMiddleware = require("../middlewares/chatMiddleware");
const allowChats = require("../middlewares/allowChatMiddlware");



const router = express.Router();


router.post("/:chatId/send", upload.single("media"), chatMiddleware, allowChats, sendMessage);

router.post("/send", upload.single("media"), chatMiddleware, allowChats, sendMessage);

router.get("/user-data/:chatId", chatMiddleware, getChat);

router.get("/allChats", getUserChats);

router.get("/:chatId", chatMiddleware, getChatMessages);

router.delete("/:chatId/message/:messageId", chatMiddleware, deleteAMessage);

router.delete("/:chatId", chatMiddleware, deleteChat);


module.exports = router;