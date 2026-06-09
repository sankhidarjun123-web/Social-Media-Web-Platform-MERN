const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});
console.log("MONGODB_URL =", process.env.MONGODB_URL);
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");
const Users = require("../models/Users.model");
const Post = require("../models/Post.model.js");
const Channel = require("../models/Channel.model.js");
const Follow = require("../models/Follow.model.js");
const Connections = require("../models/Connections.model.js");
const Comment =
    require("../models/Comment.model");

const connectDB = require("../connections");

// 1. Create users
const users = [];

// 2. Create channels
const channels = [];

// 3. Create follows
const follows = [];

// 4. Create connections
const connections = [];

// 5. Create posts
const posts = [];

// 6. Create comments
const comments = [];

// 7. Create replies
const replies = [];

// 8. Create likes
const likes = [];

// 9. Notifications
const notifications = [];


const ownerId =
    "6a28353b91f3245482a50436";

async function seed() {

    try {
        for (let i = 0; i < 120; i++) {

            const firstname =
                faker.person.firstName().replace(/[^a-zA-Z0-9]/g, "");

            const lastname =
                faker.person.lastName().replace(/[^a-zA-Z0-9]/g, "");
            const user = await Users.create({
                username:
                    `user_${i}_${faker.string.alphanumeric(5).toLowerCase()}`,

                email:
                    `seeduser${i}@example.com`,

                password: "Password123",

                firstname,
                lastname,

                profileImg: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,

                coverImg:
                    `https://picsum.photos/1200/300?random=${i}`,

                bio: faker.person.bio(),

                isVerified: true,
                isProfileCompleted: true,

                allowChats: true,
                allowConnections: true,

                followers: 0,
                followings: 0,
                connections: 0
            });

            users.push(user);
        }


        for (const user of users) {

            const channel = await Channel.create({
                channel_id: uuidv4(),

                user: user._id,

                name: {
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname
                },

                about: {
                    text: user.bio
                }
            });

            user.channel = channel._id;

            await user.save();

            channels.push(channel);
        }


        const followSet = new Set();

        for (const user of users) {

            const followCount = Math.floor(Math.random() * 20) + 10; // 10-30

            for (let i = 0; i < followCount; i++) {

                const target =
                    users[Math.floor(Math.random() * users.length)];

                if (target._id.toString() === user._id.toString())
                    continue;

                const key =
                    `${user._id}-${target._id}`;

                if (followSet.has(key))
                    continue;

                followSet.add(key);

                const follow = await Follow.create({
                    follower: user._id,
                    following: target._id
                });

                follows.push(follow);
            }
        }

        for (let i = 0; i < 80; i++) {

            const user =
                users[Math.floor(Math.random() * users.length)];

            const key =
                `${user._id}-${ownerId}`;

            if (followSet.has(key))
                continue;

            followSet.add(key);

            await Follow.create({
                follower: user._id,
                following: ownerId
            });
        }

        const connectionSet = new Set();

        for (let i = 0; i < 450; i++) {

            const sender =
                users[Math.floor(Math.random() * users.length)];

            const receiver =
                users[Math.floor(Math.random() * users.length)];

            if (
                sender._id.toString() ===
                receiver._id.toString()
            )
                continue;

            const key =
                [sender._id, receiver._id]
                    .sort()
                    .join("-");

            if (connectionSet.has(key))
                continue;

            connectionSet.add(key);

            const rand = Math.random();

            let status = "accepted";

            if (rand < 0.15)
                status = "rejected";
            else if (rand < 0.35)
                status = "pending";

            const connection =
                await Connections.create({
                    sender: sender._id,
                    receiver: receiver._id,
                    status
                });

            connections.push(connection);
        }

        for (let i = 0; i < 40; i++) {

            const user =
                users[Math.floor(Math.random() * users.length)];

            await Connections.create({
                sender: user._id,
                receiver: ownerId,
                status: "accepted"
            });
        }


        for (const user of users) {

            user.followers =
                await Follow.countDocuments({
                    following: user._id
                });

            user.followings =
                await Follow.countDocuments({
                    follower: user._id
                });

            user.connections =
                await Connections.countDocuments({
                    status: "accepted",
                    $or: [
                        { sender: user._id },
                        { receiver: user._id }
                    ]
                });

            await user.save();
        }

        const topics = [
            "react",
            "nodejs",
            "mongodb",
            "javascript",
            "fitness",
            "travel",
            "photography",
            "gaming",
            "startup",
            "design"
        ];

        for (const user of users) {

            const postCount =
                Math.floor(Math.random() * 5) + 1;

            for (let i = 0; i < postCount; i++) {

                const userChannel =
                    channels.find(
                        c => c.user.toString() === user._id.toString()
                    );

                const hasMedia =
                    Math.random() > 0.3;

                const post =
                    await Post.create({

                        post_id: uuidv4(),

                        postedBy: user._id,

                        channel: userChannel._id,

                        topic: [
                            topics[
                            Math.floor(
                                Math.random() * topics.length
                            )
                            ]
                        ],

                        text: {
                            words:
                                faker.lorem.paragraph(),
                            hashtags: [
                                "coding",
                                "mern"
                            ]
                        },

                        media: hasMedia
                            ? [
                                {
                                    url:
                                        `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
                                    public_id:
                                        uuidv4(),
                                    type: "image"
                                }
                            ]
                            : []
                    });

                posts.push(post);
            }
        }


        const owner =
            await Users.findById(ownerId);


        for (const post of posts) {

            const commentCount =
                Math.floor(Math.random() * 6) + 2;

            for (let i = 0; i < commentCount; i++) {

                const commenter =
                    users[
                    Math.floor(
                        Math.random() * users.length
                    )
                    ];

                if (
                    commenter._id.toString() ===
                    post.postedBy.toString()
                )
                    continue;

                const comment =
                    await Comment.create({

                        postedBy:
                            commenter._id,

                        commentPost:
                            post._id,

                        text: {
                            words:
                                faker.lorem.sentence()
                        }

                    });

                comments.push(comment);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function main() {
    try {

        await connectDB();

        console.log("Connected");

        await seed();

        console.log("Finished");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
