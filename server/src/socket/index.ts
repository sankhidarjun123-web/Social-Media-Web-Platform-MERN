import { Server } from "socket.io";
const Users = require('../models/Users.model');
const { onlineUsers, registeringUsers } = require('./onlineUsers');



module.exports = (io: Server) => {

    io.on("connection", (socket) => {


        socket.on("register-user", async (user: string) => {

            onlineUsers.set(user, {
                socketId: socket.id
            });

            await Users.findByIdAndUpdate(user, {
                $set: { isOnline: true }
            }, { runValidators: true })

            io.emit("online-users", [...onlineUsers.keys()]);
        });


        socket.on("verifying-email", async (email: string) => {

            registeringUsers.set(email, {
                socketId: socket.id
            });

            console.log("Email set in the socket : ", registeringUsers);
        });


        socket.on("disconnect", async () => {

            for (const [user, value] of onlineUsers) {

                if (value.socketId === socket.id) {
                    await Users.findByIdAndUpdate(user, {
                        $set: {
                            isOnline: false,
                            lastseen: new Date()
                        }
                    }, { runValidators: true });

                    onlineUsers.delete(user);
                    io.emit("online-users", [...onlineUsers.keys()]);
                    break;
                }
            }

            // Registering users cleanup
            for (const [email, value] of registeringUsers) {

                if (value.socketId === socket.id) {

                    registeringUsers.delete(email);

                    io.emit(
                        "registering-users",
                        [...registeringUsers.keys()]
                    );

                    break;
                }
            }
        })
    });
}