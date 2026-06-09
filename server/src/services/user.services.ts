const Users = require("../models/Users.model");
const Follow = require("../models/Follow.model");
const Connections = require("../models/Connections.model");
const Channel = require("../models/Channel.model");

type Query = {
    LIMIT: number;
    SKIP: number;
}

export const userFetchService = async (
    currentUser: string,
    query: Query,
    customs: Record<string, any>,
    select: string = "",
    populatePath: string = "",
    populateSelect: string = ""
) => {

    const users = await Users.find(customs)
        .limit(query.LIMIT)
        .skip(query.SKIP)
        .sort({ createdAt: -1 })
        .select(select)
        .populate(populatePath, populateSelect)
        .lean();

    const userIds = users.map((u: any) => u._id);

    const [follows, connectionAB, connectionBA] = await Promise.all([Follow.find({
        follower: currentUser,
        following: { $in: userIds }
    }), Connections.find({
        sender: currentUser,
        receiver: { $in: userIds }
    }), Connections.find({
        sender: { $in: userIds },
        receiver: currentUser
    })]);

    const followedUserIds = new Set(
        follows.map((follow: any) =>
            follow.following.toString()
        )
    );

    const senderMap = new Map(
        connectionAB.map((connection: any) => [
            connection.receiver.toString(),
            connection.status === "rejected"
                ? ""
                : connection.status
        ])
    );

    const receiverMap = new Map(
        connectionBA.map((connection: any) => [
            connection.sender.toString(),
            connection.status === "rejected"
                ? ""
                : connection.status
        ])
    );

    const channelIds = users.map(
        (user: any) => user.channel.toString()
    );

    const channels = await Channel.find({
        _id: { $in: channelIds },
        visibility: "public"
    }).lean();

    const channelMap = new Map(
        channels.map((channel: any) => [
            channel._id.toString(),
            channel
        ])
    );

    const filteredUsers = users.filter((user: any) =>
        channelMap.has(
            user.channel.toString()
        )
    );

    const updatedUsers = filteredUsers.map((user: any) => {

        const userId = user._id.toString();
        user.followed =
            followedUserIds.has(user._id.toString());

        user.allowEdit =
            user._id.toString() === currentUser;

        user.connectionStatus = {
            sender: senderMap.get(userId) || "",
            receiver: receiverMap.get(userId) || ""
        };

        return user;
    });

    return updatedUsers;
};