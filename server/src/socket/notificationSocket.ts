const { onlineUsers } = require('./onlineUsers');
const { getIO } =
    require("./socket");

const notificationSocket = (users: string[], notificationData: any) => {

    const io = getIO();
    users.forEach((user) => {

        const recievedSocketId = onlineUsers.get(user);

        if (recievedSocketId) {

            io.to(recievedSocketId.socketId)
                .emit("new_notification", notificationData);
        }
    });
}

module.exports = notificationSocket;