const Search = require('../models/Search.model');
const Post = require('../models/Post.model');
const Users = require('../models/Users.model');
const Follow = require('../models/Follow.model');
const Like = require('../models/Like.model');
import { postFetchService } from "../services/post.services";
import { userFetchService } from "../services/user.services";
import { addVisitedUser, addSearches } from "../services/search.services";
import { Request, Response } from "express";
import { postRanking, userRanking } from "../services/feedRanking.services";


// Used to get all the post and users based on the search query
const getSearchResults = async (req: Request, res: Response) => {

    const LIMIT: number = Number(req.query?.limit) || 10;
    const SKIP: number = Number(req.query?.skip) || 0;
    const get: string = req.query?.get as string || "all";
    try {
        const user = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const keyword = (req.query.keywords as string)
            ?.replace(/\s+/g, "");
        // post fetched from the keyword

        let posts, rankedPosts, numberPosts, noMorePosts
        if (get === "posts" || get === "all") {
            posts = await postFetchService(user, { LIMIT, SKIP }, {
                postedBy: { $ne: user },
                $or: [
                    {
                        "text.words": {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        "text.hashtags": {
                            $regex: keyword,
                            $options: "i"
                        }
                    }
                ],
                visibility: {
                    $in: ["Public", "public"]
                }
            });
            rankedPosts = await Promise.all(
                posts.map(async (post: any) => ({
                    ...post,
                    score: await postRanking(post, user)
                }))
            );

            rankedPosts.sort((a, b) => b.score - a.score);

            numberPosts = await Post.countDocuments({
                postedBy: { $ne: user },
                $or: [
                    {
                        "text.words": {
                            $regex: keyword,
                            $options: "i"
                        }
                    }, {
                        "text.hashtags": {
                            $regex: keyword,
                            $options: "i"
                        }
                    }],
                visibility: {
                    $in: ["Public", "public"]
                }
            });

            const noMorePosts = SKIP + LIMIT >= numberPosts;
        }

        // users fetched from the keyword
        let users, rankedUsers, numberUsers, noMoreUsers;
        if (get === "peoples" || get === "all") {
            users = await userFetchService(
                user,
                { LIMIT, SKIP },
                {
                    _id: { $ne: user },
                    $or: [
                        {
                            $expr: {
                                $regexMatch: {
                                    input: {
                                        $replaceAll: {
                                            input: {
                                                $concat: ["$firstname", "$lastname"]
                                            },
                                            find: " ",
                                            replacement: ""
                                        }
                                    },
                                    regex: keyword,
                                    options: "i"
                                }
                            }
                        },
                        {
                            firstname: {
                                $regex: keyword,
                                $options: "i"
                            }
                        },
                        {
                            username: {
                                $regex: keyword,
                                $options: "i"
                            }
                        },
                        {
                            interest: {
                                $regex: keyword,
                                $options: "i"
                            }
                        }
                    ]
                }
            );

            rankedUsers = await Promise.all(
                users.map(async (userData: any) => ({
                    ...userData,
                    score: await userRanking(userData, user)
                }))
            );

            rankedUsers.sort((a, b) => b.score - a.score);

            numberUsers = await Users.countDocuments({
                _id: { $ne: user },
                $or: [
                    {
                        $expr: {
                            $regexMatch: {
                                input: {
                                    $replaceAll: {
                                        input: {
                                            $concat: ["$firstname", "$lastname"]
                                        },
                                        find: " ",
                                        replacement: ""
                                    }
                                },
                                regex: keyword,
                                options: "i"
                            }
                        }
                    }, {
                        firstname: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }, {

                        username: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }, {

                        interest: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }]
            });


            noMoreUsers = SKIP + LIMIT >= numberUsers;
        }

        // create a new search in the database if it doesn't exist else increment the number of times
        // it is used
        const createSearch = await Search.findOneAndUpdate({ search: keyword }, {
            $inc: { searchCount: 1 }
        }, {
            upsert: true,
            new: true,
            runValidators: true
        });
        const response: any = {
            message: "Here are the search results",
            nextSkip: SKIP + LIMIT
        }

        if (get === "all") {
            response.posts = rankedPosts;
            response.users = rankedUsers;
            response.noMoreUsers = noMoreUsers;
            response.noMorePosts = noMorePosts;
        } else if (get === "posts") {
            response.posts = rankedPosts;
            response.noMorePosts = noMorePosts;
        } else if (get === "peoples") {
            response.users = rankedUsers;
            response.noMoreUsers = noMoreUsers;
        }
        res.status(200).json(response);

        // adding search into the search array by user
        await addSearches(keyword, user);


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};


// Gets only the keywords related to what user typed
const getSearchRelated = async (req: Request, res: Response) => {

    try {

        const user: string = req.user?.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const input: string = req.body?.input as string;

        const results = await Search.find({
            search: {
                $regex: input,
                $options: "i"
            }
        })
            .sort({ searchCount: -1 })
            .limit(10)

        res.status(200).json({
            message: "Searches found",
            results
        })
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}


const addSearchedUsers = async (req: Request, res: Response) => {
    try {
        const user = req.user?.id;


        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const requestedUserId = req.params?.requestedUserId as string;

        if (!requestedUserId) {
            return res.status(400).json({ message: "Requested user id is required" });
        }

        await addVisitedUser(requestedUserId, user);

        res.status(200).json({ message: "add search upgraded " });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }

}

module.exports = { getSearchResults, getSearchRelated, addSearchedUsers };