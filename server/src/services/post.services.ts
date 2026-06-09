const Post = require("../models/Post.model");
const Channel = require("../models/Channel.model");
const Follow = require("../models/Follow.model");
const Like = require("../models/Like.model");

type Query = {
    LIMIT: number,
    SKIP: number
}

export const postFetchService = async (
    user: string,
    query: Query,
    customs: Record<string, any>
) => {

    const posts = await Post.find({
        ...customs
    })
        .sort({ createdAt: -1 })
        .limit(query.LIMIT)
        .skip(query.SKIP)
        .populate(
            "postedBy",
            "_id username firstname lastname channel profileImg followers followings connections location"
        );

    const postIds = posts.map((p: any) => p._id);
    const userIds = posts.map((p: any) => p.postedBy._id);

    const [likes, follows] = await Promise.all([
        Like.find({
            likedBy: user,
            postLiked: { $in: postIds }
        }),

        Follow.find({
            follower: user,
            following: { $in: userIds }
        })
    ]);

    const likedPostIds = new Set(
        likes.map((like: any) => like.postLiked.toString())
    );

    const followedPostIds = new Set(
        follows.map((follow: any) => follow.following.toString())
    );

    const channelIds = posts.map(
        (post: any) => post.postedBy.channel.toString()
    );

    const channels = await Channel.find({
        _id: { $in: channelIds },
        visibility: "public",
        contentVisibility: "public"
    }).lean();

    const channelMap = new Map(
        channels.map((channel: any) => [
            channel._id.toString(),
            channel
        ])
    );

    const filteredPosts = posts.filter((post: any) =>
        channelMap.has(
            post.postedBy.channel.toString()
        )
    );

    const updatedPosts = filteredPosts.map((post: any) => {
        const postObj = post.toObject();

        postObj.isLiked =
            likedPostIds.has(post._id.toString());

        postObj.isFollowed =
            followedPostIds.has(post.postedBy._id.toString());

        postObj.allowEdit =
            post.postedBy._id.toString() === user;

        return postObj;
    });

    return updatedPosts;
};