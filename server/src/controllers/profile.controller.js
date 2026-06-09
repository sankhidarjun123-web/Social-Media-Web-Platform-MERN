const Users = require('../models/Users.model');
const { uploadToGCS, deleteFromGCS } = require('../utils/gcsServices');
const { createChannel } = require('../services/channelSetup.services');
const mongoose = require('mongoose');
import AppError from '../utils/AppError';
import isValidLocation from '../utils/locationValidator';


// Creating a profile
const createProfile = async (req, res) => {

    let session;
    let uploadedFiles = [];

    try {

        let { username, firstname, bio, lastname, DOB, location, websites, interests } = req.body;
        DOB = DOB ? JSON.parse(DOB) : null;
        location = location ? JSON.parse(location) : null;
        websites = websites ? JSON.parse(websites) : [];
        interests = interests ? JSON.parse(interests) : [];

        const userId = req.user?.id;


        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findById(userId);

        const isGoogleUser = !!user.googleId;

        if (isGoogleUser && (!username || username.trim() === "")) {
            return res.status(400).json({ message: "Username is not given" });
        } else if (username && /\s/.test(username)) {
            return res.status(400).json({
                message: "Username cannot contain spaces"
            });
        }

        if (!firstname || firstname.trim() === "") {
            return res.status(400).json({ message: "First Name required" });
        } else if (/\s/.test(firstname)) {
            return res.status(400).json({
                message: "First name cannot have leading or trailing spaces"
            });
        }

        const updateFields = {
            firstname: firstname.trim(),
            isProfileCompleted: true
        };

        if (username && username.trim() !== "") {
            updateFields.username = username.trim();
        }


        if (lastname && lastname.trim() !== "") {
            if (/\s/.test(lastname)) {
                return res.status(400).json({ message: "last name cannot have leading or trailing spaces" })
            }
            updateFields.lastname = lastname.trim();
        }

        if (bio && bio.trim() !== "") {
            updateFields.bio = bio.trim();
        }

        if (Array.isArray(websites) && websites.length > 0) {
            updateFields.websites = websites;
        }

        if (DOB) {
            const { day, month, year } = DOB;
            const anyFilled = day || month || year;
            const allFilled = day && month && year;
            if (anyFilled && !allFilled) {
                return res.status(400).json({ message: "Incomplete DOB" });
            } if (allFilled) {
                const userDOB = new Date(year, month - 1, day);
                if (isNaN(userDOB.getTime())) {
                    return res.status(400).json({ message: "Invalid DOB" });
                }

                if (userDOB > new Date()) {
                    return res.status(400).json({ message: "DOB cannot be future date" });
                }

                updateFields.DOB = userDOB;
            }
        }

        // Location Validation 

        if (location) {
            const { city, state, country } =
                location;
            const anyFilled = city || state || country;
            const allFilled = city && state && country;
            if (anyFilled && !allFilled) {
                return res.status(400).json({ message: "Incomplete location" });
            }

            if (allFilled) {

                const trimmedCity = city.trim();
                const trimmedState = state.trim();
                const trimmedCountry = country.trim();

                if (
                    !isValidLocation(
                        trimmedCity,
                        trimmedState,
                        trimmedCountry
                    )
                ) {
                    return res.status(400).json({
                        message: "Incorrect location"
                    });
                }

                updateFields.location = {
                    city: trimmedCity,
                    state: trimmedState,
                    country: trimmedCountry
                };
            }
        }

        if (req.files?.profileImg?.[0]) {
            const uploadedProfile = await uploadToGCS(
                req.files.profileImg[0],
                "profiles",
                `profile-${userId}`,
                { width: 500, height: 500 },
                "image"
            );

            uploadedFiles.push(uploadedProfile.url);
            updateFields.profileImg = uploadedProfile.url;
        }

        if (req.files?.coverImg?.[0]) {
            const uploadedCover = await uploadToGCS(
                req.files.coverImg[0],
                "covers",
                `cover-${userId}`,
                { width: 1200, height: 400 },
                "image"
            );

            uploadedFiles.push(uploadedCover.url);
            updateFields.coverImg = uploadedCover.url
        }

        // ---- Start transaction ----
        session = await mongoose.startSession();
        session.startTransaction();

        const userProfile = await Users.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true, session }
        );

        if (!userProfile) {
            throw new Error("User not found");
        }

        const channelCreated = await createChannel(
            userId,
            userProfile,
            session
        );

        await Users.updateOne(
            { _id: userId },
            { $set: { channel: channelCreated._id } },
            { runValidators: true, session }
        );

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json({
            message: "Profile created successfully"
        });

    } catch (err) {

        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }

        // Cleanup uploaded files if transaction fails
        for (const file of uploadedFiles) {
            try {
                await deleteFromGCS(file, "image");
            } catch (cleanupErr) {
                console.error("Cleanup failed:", cleanupErr);
            }
        }

        console.error(err);
        return res.status(500).json({
            message: "Error creating profile"
        });
    }
};


// Editing a profile
const editProfile = async (req, res) => {
    const uploadedFiles = [];
    let oldProfileImg = null, oldCoverImg = null;
    try {
        let { firstname, lastname, bio, websites,
            location, DOB, removedProfileImg, removedCoverImg } = req.body;
        location = location ? JSON.parse(location) : null;
        websites = websites ? JSON.parse(websites) : [];
        const user = req.user.id;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userDoc = await Users.findById(user);

        if (!userDoc) {
            return res.status(404).json({ message: "User not found " });
        }

        const updates = {};

        if (firstname) updates.firstname = firstname;
        if (lastname) updates.lastname = lastname;
        if (bio) updates.bio = bio;

        if (Array.isArray(websites)) {
            updates.websites = websites;
        }


        if (location && typeof location === "object") {
            const { city = "", state = "", country = "" } = location;

            const anyFilled = city || state || country;
            const allFilled = city && state && country;

            if (anyFilled && !allFilled) {
                return res.status(400).json({ message: "Incomplete location" });
            }

            if (allFilled) {

                const trimmedCity = city.trim();
                const trimmedState = state.trim();
                const trimmedCountry = country.trim();

                if (
                    !isValidLocation(
                        trimmedCity,
                        trimmedState,
                        trimmedCountry
                    )
                ) {
                    return res.status(400).json({
                        message: "Incorrect location"
                    });
                }

                updates.location = {
                    city: trimmedCity,
                    state: trimmedState,
                    country: trimmedCountry
                };
            } else {
                // If all empty, clear location
                updates.location = null;
            }
        }

        if (DOB) {

            const [year, month, day] = DOB.split("-");

            const anyFilled = year || month || day;
            const allFilled = year && month && day;

            if (anyFilled && !allFilled) {
                return res.status(400).json({
                    message: "Incomplete DOB"
                });
            }

            const userDOB = new Date(
                Date.UTC(
                    Number(year),
                    Number(month) - 1,
                    Number(day)
                )
            );

            if (
                isNaN(userDOB.getTime()) ||
                userDOB.getFullYear() !== Number(year) ||
                userDOB.getMonth() !== Number(month) - 1 ||
                userDOB.getDate() !== Number(day)
            ) {
                return res.status(400).json({
                    message: "Invalid DOB"
                });
            }

            if (userDOB > new Date()) {
                return res.status(400).json({
                    message: "DOB cannot be future date"
                });
            }

            updates.DOB = userDOB;
        }

        if (req.files?.currentProfileImg?.[0]) {

            oldProfileImg = userDoc.profileImg;
            const uploadedProfile = await uploadToGCS(
                req.files.currentProfileImg[0],
                "profiles",
                `profile-${user}`,
                { width: 500, height: 500 },
                "image"
            );
            uploadedFiles.push(uploadedProfile.url);
            updates.profileImg = uploadedProfile.url
        } else if (removedProfileImg === "true" && userDoc.profileImg) {
            oldProfileImg = userDoc.profileImg;
            updates.profileImg = null;
        }

        if (req.files?.currentCoverImg?.[0]) {

            oldCoverImg = userDoc.coverImg;
            const uploadedCover = await uploadToGCS(
                req.files.currentCoverImg[0],
                "covers",
                `cover-${user}`,
                { width: 1200, height: 400 },
                "image"
            );
            uploadedFiles.push(uploadedCover.url);
            updates.coverImg = uploadedCover.url
        } else if (removedCoverImg === "true" && userDoc.coverImg) {
            oldCoverImg = userDoc.coverImg;
            updates.coverImg = null;
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ message: "No valid fields to update" });
        }


        const userUpdates = await Users.findByIdAndUpdate(
            user,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!userUpdates) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found!" });
        }

        if (oldProfileImg) {
            await deleteFromGCS(oldProfileImg, "image");
        }

        if (oldCoverImg) {
            await deleteFromGCS(oldCoverImg, "image");
        }

        res.status(200).json({
            message: "User Profile Updated",
            userUpdates
        });
    } catch (error) {
        console.error(error);

        for (const file of uploadedFiles) {
            try {
                await deleteFromGCS(file, "image");
            } catch (cleanupErr) {
                onsole.error("Cleanup failed:", cleanupErr);
            }
        }
        return res.status(500).json({
            message: "Something went wrong while updating profile"
        });
    }
}

module.exports = { createProfile, editProfile };