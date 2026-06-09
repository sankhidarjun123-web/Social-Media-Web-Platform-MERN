const Channel = require('../models/Channel.model');
const { v4: uuidv4 } = require('uuid');


// For creating a channel
const createChannel = async (user, userDetails, session) => {
    if (!user) {
        throw new Error("User id not provided for the channel");
    }

    const channel_id = uuidv4();

    if (!userDetails) {
        throw new Error("User details not provided for the channel");
    }

    // Create a channel for the user
    const channelCreated = await Channel.create(
        [{
            channel_id,
            name: {
                username: userDetails.username,
                firstname: userDetails.firstname,
                lastname: userDetails.lastname
            },
            user
        }],
        { session }
    );

    if (!channelCreated || channelCreated.length === 0) {
        throw new Error("Error creating the channel");
    }

    return channelCreated[0];

}

module.exports = {
    createChannel
};