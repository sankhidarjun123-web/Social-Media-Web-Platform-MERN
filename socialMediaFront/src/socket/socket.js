import { io } from "socket.io-client";


const SERVER = import.meta.env.VITE_SERVER_URL
const socket = io(`${SERVER}`, {
   withCredentials: true,
   autoConnect: false
});

export default socket;