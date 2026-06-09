const Follow = require('../models/Follow.model');
const Users = require('../models/Users.model');
const Channel = require('../models/Channel.model');
const Post = require('../models/Post.model');
const Connections = require('../models/Connections.model');

const {
  sendNotification
} = require(
  "../services/notification.services"
);

// For getting all followers of a particular user
const getAllFollower = async (req, res) => {

  const LIMIT = parseInt(req.query?.limit) || 10;
  const SKIP = parseInt(req.query?.skip) || 0;

  try {

    const user = req.user?.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const followList = await Follow.find({ following: user })
      .limit(LIMIT)
      .skip(SKIP)
      .sort({ createdAt: -1 })
      .select("follower")
      .populate(
        "follower",
        "_id username firstname lastname profileImg coverImg followers followings connections channel bio location"
      ).lean();

    const userIds = followList.map((u) => u.follower._id.toString());
    const [follow, connectionAB, connectionBA] = await Promise.all([
      Follow.find({
        follower: user,
        following: { $in: userIds }
      }).lean(),
      Connections.find({
        sender: user,
        receiver: { $in: userIds }
      }), Connections.find({
        sender: { $in: userIds },
        receiver: user
      })]);

    const followedUserIds = new Set(
        follow.map((follow) =>
            follow.following.toString()
        )
    );

    const senderMap = new Map(
      connectionAB.map((connection) => [
        connection.receiver.toString(),
        connection.status === "rejected"
          ? ""
          : connection.status
      ])
    );

    const receiverMap = new Map(
      connectionBA.map((connection) => [
        connection.sender.toString(),
        connection.status === "rejected"
          ? ""
          : connection.status
      ])
    );

    const updatedFollowList = followList.map((items) => {

      const userId = items.follower._id.toString();
      items.follower.followed = followedUserIds.has(userId);

      items.follower.connectionStatus = {
        sender: senderMap.get(userId) || "",
        receiver: receiverMap.get(userId) || ""
      };

      return items;
    });


    const total = await Follow.countDocuments({ following: user });


    const noMoreData = SKIP + LIMIT >= total;

    res.status(200).json({
      message: "Follower list fetched successfully",
      followList: updatedFollowList,
      noMoreData,
      nextSkip: SKIP + LIMIT
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      message: "Error fetching follow list",
      error: error.message
    });

  }
};


const getAllFollowing = async (req, res) => {

  const LIMIT = parseInt(req.query?.limit) || 10;
  const SKIP = parseInt(req.query?.skip) || 0;

  try {

    const user = req.user?.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const followList = await Follow.find({ follower: user })
      .limit(LIMIT)
      .skip(SKIP)
      .sort({ createdAt: -1 })
      .select("following")
      .populate(
        "following",
        "_id username firstname lastname profileImg coverImg followers followings connections channel bio location"
      ).lean();

    const userIds = followList.map((u) => u.following._id.toString());
    const [connectionAB, connectionBA] = await Promise.all([
      Connections.find({
        sender: user,
        receiver: { $in: userIds }
      }), Connections.find({
        sender: { $in: userIds },
        receiver: user
      })]);

    const senderMap = new Map(
      connectionAB.map((connection) => [
        connection.receiver.toString(),
        connection.status === "rejected"
          ? ""
          : connection.status
      ])
    );

    const receiverMap = new Map(
      connectionBA.map((connection) => [
        connection.sender.toString(),
        connection.status === "rejected"
          ? ""
          : connection.status
      ])
    );

    const updatedFollowList = followList.map((items) => {

      const userId = items.following._id.toString();
      items.following.followed =
        true

      items.following.connectionStatus = {
        sender: senderMap.get(userId) || "",
        receiver: receiverMap.get(userId) || ""
      };

      return items;
    });


    const total = await Follow.countDocuments({ follower: user });

    const noMoreData = SKIP + LIMIT >= total;
    console.log(noMoreData, SKIP, LIMIT, total);

    res.status(200).json({
      message: "Following list fetched successfully",
      followList: updatedFollowList,
      noMoreData,
      nextSkip: SKIP + LIMIT
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      message: "Error fetching follow list",
      error: error.message
    });

  }
};


// For sending a follow request for a particular user
const followUser = async (req, res) => {
  try {
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { targetId } = req.params;


    if (!targetId) {
      return res.status(400).json({ message: "Target is required" });
    }

    if (followerId === targetId) {
      return res.status(400).json({ message: "Following yourself is not allowed" });
    }

    const alreadyFollowing = await Follow.findOne({
      follower: followerId,
      following: targetId
    });

    if (alreadyFollowing) {
      return res.status(409).json({ message: "You are already following this user" });
    }

    const follow = await Follow.create({
      follower: followerId,
      following: targetId
    });

    await Users.findByIdAndUpdate(targetId, {
      $inc: { followers: 1 }
    });

    await Users.findByIdAndUpdate(followerId, {
      $inc: { followings: 1 }
    });

    const userData = await Users.findById(followerId).select("username profileImg");
    await sendNotification({
      receiver: [targetId],
      sender: followerId,
      type: "follow",
      link: "/network",
      image: userData?.profileImg,
      mainMessage:
        `${userData?.username} started following you`
    });

    res.status(201).json({
      message: "Successfully followed the user",
      follow
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Something went wrong while following the user",
      error: err.message
    });
  }
};

// For the unfollowing of the user
const unFollowUser = async (req, res) => {
  try {
    const followerId = req.user?.id;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { targetId } = req.params;

    if (!targetId) {
      return res.status(400).json({ message: "Target is required" });
    }

    if (followerId === targetId) {
      return res.status(400).json({ message: "Unfollowing yourself is not allowed" });
    }

    const userRec = await Users.findById(targetId);

    if (!userRec) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = await Follow.findOne({
      follower: followerId,
      following: targetId
    });

    if (!alreadyFollowing) {
      return res.status(409).json({ message: "You not following the user yet!" });
    }


    await Follow.deleteOne({
      follower: followerId,
      following: targetId
    });

    await Users.findByIdAndUpdate(targetId, {
      $inc: { followers: -1 }
    });

    await Users.findByIdAndUpdate(followerId, {
      $inc: { followings: -1 }
    });


    res.status(200).json({
      message: "Successfully unfollowed the user"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Something went wrong while following the user",
      error: err.message
    });
  }
}


module.exports = { getAllFollower, getAllFollowing, followUser, unFollowUser };
