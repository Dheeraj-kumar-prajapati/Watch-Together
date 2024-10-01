import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '/public/css/joinRoom.css';

const IP = 'localhost'

function JoinRoom() {

    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [password, setPassword] = useState('');
    const [roomOption, setRoomOption] = useState('1');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!username) newErrors.username = 'Username is required';
        if (!room) newErrors.room = 'Room ID is required';
        if (!password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (roomOption === '1') {
            handleCreateRoom();
        } else {
            handleJoinRoom();
        }
    };

    const handleCreateRoom = () => {
        const roomData = {
            username,
            roomId: room,
            password
        };

        fetch(`http://${IP}:3000/api/room/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Room created:', data);
                navigate('/video', { state: { username: username, admin: "admin", roomId: room } });
            })
            .catch((error) => {
                console.error('Error creating room:', error);
            });
    };

    const handleJoinRoom = () => {
        const roomData = {
            username,
            roomId: room,
            password
        };

        fetch(`http://${IP}:3000/api/room/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Joined room:', data);
                    navigate('/video', { state: { username: username, admin: "user", roomId: room } });
                } else {
                    setErrors({ room: data.error });
                }
            })
            .catch((error) => {
                console.error('Error joining room:', error);
            });
    };

    return (
        <div>
            {/* <div className="container" align="center"> */}
            {/* <img src="/images/logo2.png" style={{ width: '30px', height: '20px' }} alt="Chat Logo" /> */}
            {/* <h1>Watch Together!</h1> */}
            {/* </div> */}
            <div className="join-container">
                <header className="join-header">
                    <h1><i className="fas fa-smile"></i> Let's Watch Together!</h1>
                </header>
                <main className="join-main">
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="Enter username"
                                required
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setErrors({ ...errors, username: '' });
                                }}
                            />
                            {errors.username && <span className="error" style={{ color: "red" }}>{errors.username}</span>}
                        </div>
                        <div className="form-control">
                            <label htmlFor="Select">Select</label>
                            <select
                                id="Select"
                                value={roomOption}
                                onChange={(e) => setRoomOption(e.target.value)}
                            >
                                <option value="1">Create a new room</option>
                                <option value="2">Join an room</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label htmlFor="room">Room Id</label>
                            <input
                                type="text"
                                name="room"
                                id="room"
                                placeholder="Enter room id"
                                required
                                value={room}
                                onChange={(e) => {
                                    setRoom(e.target.value);
                                    setErrors({ ...errors, room: '' });
                                }}
                            />
                            {errors.room && <span className="error" style={{ color: "red" }}>{errors.room}</span>}
                        </div>
                        <div className="form-control">
                            <label htmlFor="Password">Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                style={{ width: '100%', height: '38px' }}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors({ ...errors, password: '' });
                                }}
                            />
                            {errors.password && <span className="error" style={{ color: "red" }}>{errors.password}</span>}
                        </div>
                        <button type="submit" className="btn">Join Room</button>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default JoinRoom;
