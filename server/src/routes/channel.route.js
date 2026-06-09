const express = require('express');
const { getChannel, getChannelPosts, setAbout, getChannelPhotos, getChannelVideos } = require("../controllers/channel.controller");
const auth = require("../middlewares/authMiddleware");
const { validateChannel } = require("../middlewares/userMiddleware");
const { channelVisibility, channelContentVisibility } = require("../middlewares/channelMiddlware");

const router = express.Router();

router.get("/:channelId", auth,channelVisibility, getChannel);

router.get("/:channelId/posts", auth, channelVisibility, channelContentVisibility, getChannelPosts);

router.get("/:channelId/images", auth, channelVisibility, channelContentVisibility, getChannelPhotos);

router.get("/:channelId/videos", auth, channelVisibility, channelContentVisibility, getChannelVideos);

router.patch("/:channelId/about", auth, channelVisibility, channelContentVisibility, setAbout);

module.exports = router;