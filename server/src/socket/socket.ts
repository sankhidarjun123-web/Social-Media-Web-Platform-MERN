import { Server } from "socket.io";

let io: Server;

const initSocket = (server: any) => {

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    return io;
};

const getIO = () => {

    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

module.exports = {
    initSocket,
    getIO
};