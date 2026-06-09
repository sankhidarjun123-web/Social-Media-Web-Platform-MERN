import AppError from "../utils/AppError";

const Users = require("../models/Users.model");




export const addSearches = async (keyword: string, userId: string) => {

    try {

        if (!userId) {
            throw new AppError("userId is required", 400);
        }

        if (!keyword) {
            throw new AppError("Search keyword is required", 400);
        }

        await Users.updateOne({
            _id: userId
        }, {
            $pull: { searches: keyword }
        });


        await Users.updateOne(
            { _id: userId },
            {
                $push: {
                    searches: {
                        $each: [keyword],
                        $slice: -30
                    }
                }
            }, {
            runValidators: true
        }
        );

    } catch (err) {
        throw new AppError("Internal server error", 500);
    }
}


export const addVisitedUser = async (visitedUser: string, userId: string) => {

    try {

        if (!userId) {
            throw new AppError("userId is required", 400);
        }

        if (!visitedUser) {
            throw new AppError("id for the visited user is required", 400);
        }

        const visitedUserInfo = await Users.findById(visitedUser).select("channel _id username firstname lastname profileImg").lean();

        if (!visitedUserInfo) {
            throw new AppError("Visited user not found", 404);
        }

        await Users.updateOne(
            { _id: userId },
            {
                $pull: {
                    visitedUsers: {
                        visitedUserId: visitedUserInfo._id
                    }
                }
            }, {
            runValidators: true
        }
        );

        await Users.updateOne({
            _id: userId
        }, {
            $push: {
                visitedUsers: {
                    $each: [{
                        visitedUserChannel: visitedUserInfo?.channel,
                        visitedUserId: visitedUserInfo?._id,
                        visitedUserUsername: visitedUserInfo?.username,
                        visitedUserFirstname: visitedUserInfo?.firstname,
                        visitedUserLastname: visitedUserInfo?.lastname,
                        visitedUserProfileImg: visitedUserInfo?.profileImg
                    }],

                    $slice: -5
                }
            }
        })
    } catch (err) {
        throw new AppError("Internal server error", 500);
    }
}