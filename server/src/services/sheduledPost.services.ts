import cron from "node-cron";
const Post = require("../models/Post.model");

const publishScheduledPosts = (): void => {

    cron.schedule("* * * * *", async () => {

        try {

            const now = new Date();

            const updatedPosts = await Post.updateMany(
                {
                    visibility: "Sheduled",
                    date: { $lte: now }
                },
                {
                    $set: {
                        visibility: "Public"
                    }
                }
            );

            if(updatedPosts.modifiedCount > 0) {

                console.log(
                    `${updatedPosts.modifiedCount} scheduled posts published`
                );

            }

        } catch (err) {

            console.log("Cron Error:", err);

        }

    });

};

export default publishScheduledPosts;