const { onlineUsers } = require('./onlineUsers');
const { getIO } =
    require("./socket");

const messageSocket = (users: string[], messageData: any) => {

    const io = getIO();
    users.forEach((user) => {

        const recievedSocketId = onlineUsers.get(user);
        console.log(messageData);
        console.log(user);
        console.log("Socket id: ", recievedSocketId);
        if (recievedSocketId) {

            io.to(recievedSocketId.socketId)
                .emit("new_message", messageData);
        }
    });
}

module.exports = messageSocket;