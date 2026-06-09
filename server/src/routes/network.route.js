const express = require('express');
const { getAllFollower, getAllFollowing, followUser, unFollowUser } = require('../controllers/follow.controller');
const { getAllConnections, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection } = require('../controllers/connection.controller');
const allowConnections = require("../middlewares/connectionsMiddleware");


const router = express.Router();

router.get("/follow/followers", getAllFollower);

router.get("/follow/followings", getAllFollowing);

router.get("/connections", getAllConnections);

router.post("/:targetId/follow", followUser);

router.delete("/:targetId/follow", unFollowUser);

router.post("/:targetId/connection/connection_request", allowConnections, sendConnectionRequest);

router.put("/:requestId/connection/connection_request", acceptConnectionRequest);

router.delete("/:requestId/connection/connection_request", rejectConnectionRequest);

router.delete("/:targetId/connection", removeConnection);


module.exports = router;