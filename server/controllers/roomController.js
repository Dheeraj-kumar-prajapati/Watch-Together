const rooms = require('../models/roomModel');

const createRoom = (req, res) => {
    const { roomId, password, username } = req.body;

    if (rooms[roomId]) {
        return res.status(400).json({ error: 'Room ID already exists' });
    }

    rooms[roomId] = {
        password,
        users: [username],
    };

    return res.status(201).json({ success: true, roomId });
};

const joinRoom = (req, res) => {
    const { roomId, password, username } = req.body;

    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (rooms[roomId].password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    rooms[roomId].users.push(username);
    return res.status(200).json({ success: true, roomId });
};

module.exports = { createRoom, joinRoom };
