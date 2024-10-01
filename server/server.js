const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomHandle = require('./routes/roomRoutes');
const uploadVideo = require('./routes/uploadRoutes');
let { rooms, currentVideoState } = require('./models/roomModel');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/videos', express.static('videos'));

app.use('/api/room', roomHandle);
app.use('/api/upload', uploadVideo);


io.on('connection', (socket) => {
    console.log('New WebSocket connection established.');

    socket.on('joinRoom', ({ roomId, username }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { users: [] };
        }

        socket.join(roomId);
        rooms[roomId].users.push(username);
        console.log(`${username} joined room: ${roomId}`);

        socket.broadcast.to(roomId).emit('message', {
            user: 'admin',
            text: `${username} has joined the room.`,
        });

        // Send the current video state to the newly joined user
        console.log("state : ", currentVideoState);
        socket.emit('video-initial-state', currentVideoState);
    });

    // Handle video control events
    socket.on('video-control', (data) => {
        const { roomId, action, currentTime } = data;

        currentVideoState = {
            action: action,
            currentTime: currentTime
        };

        console.log(`Video control: ${action} at time ${currentTime} in room ${roomId}`);
        socket.broadcast.to(roomId).emit('video-control', data); // Broadcast to others in the room
    });

    // Handle new video source event
    socket.on('video-new-source', (data) => {
        const { videoSrc, roomId } = data;
        console.log("data : ", data);

        currentVideoState.videoSrc = videoSrc;

        // Broadcast the new video source to all users in the room
        socket.broadcast.to(roomId).emit('video-new-source', videoSrc);
    });


    // Handle sending messages in the chat
    socket.on('sendMessage', ({ roomId, message, username }) => {
        io.to(roomId).emit('message', { user: username, text: message });
    });


    // Handle user leaving the room
    socket.on('leaveRoom', ({ roomId, username }) => {
        if (rooms[roomId]) {
            rooms[roomId].users = rooms[roomId].users.filter(user => user !== username);
        }

        console.log(`${username} left room: ${roomId}`);
        socket.broadcast.to(roomId).emit('message', {
            user: 'admin',
            text: `${username} has left the room.`,
        });
    });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
