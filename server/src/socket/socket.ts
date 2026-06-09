import { Server } from "socket.io";

let io: Server;

const initSocket = (server: any) => {

    io = new Server(server, {
        cors: {
            origin: ["https://localhost:5173", "https://localhost:5174"],
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