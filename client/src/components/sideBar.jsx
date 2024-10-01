import React, { useContext } from 'react';
import { SocketContext } from '../services/Socket';
import '/public/css/sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const socket = useContext(SocketContext); // Access the socket 
    const navigate = useNavigate();

    const location = useLocation();
    const { username, roomId } = location.state || {};

    const handleLeaveRoom = () => {
        if (socket) {
            socket.emit('leaveRoom', { roomId, username });

            navigate('/');
            localStorage.removeItem('videoSrc');
            localStorage.removeItem('videoStatus');
            console.log(`${username} left the room ${roomId}`);
        }
    };

    return (
        <div className="sidebar">
            <h2>Watch Together</h2>
            <div className="room-info">
                <h3>Room ID:</h3>
                <h4>{roomId}</h4>
            </div>
            <div className="user-list">
                <h3>User</h3>
                <h3>{username}</h3>
            </div>
            <button className="leave-button" onClick={handleLeaveRoom}>
                Leave Room
            </button>
        </div>
    );
};

export default Sidebar;
