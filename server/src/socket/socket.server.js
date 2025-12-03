import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN_URL,
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log('a user connected')
        socket.on('disconnect', () => {
            console.log('user disconnected')
        })
    })
    return io;
}

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}

export { initSocket, getIO }