import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { SocketContext } from '../services/Socket';
import '/public/css/videoPlayer.css'

const VideoPlayer = () => {
    const videoRef = useRef(null);
    const socket = useContext(SocketContext);
    const location = useLocation();
    const { roomId, admin } = location.state || {};

    const [hasUserInteracted, setHasUserInteracted] = useState(true);
    const [videoStatus, setVideoStatus] = useState(null);
    const [videoSrc, setVideoSrc] = useState('./652333414.mp4'); // Default video


    // Helper function to save room data in localStorage
    const saveRoomData = (roomId, data) => {
        const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        const updatedRooms = rooms.filter(room => room.roomId !== roomId);
        updatedRooms.push({ roomId, ...data });
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    };

    // Helper function to get room data from localStorage
    const getRoomData = (roomId) => {
        const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
        return rooms.find(room => room.roomId === roomId);
    };

    // Load video status and videoSrc from localStorage on initial render
    useEffect(() => {
        const savedRoomData = getRoomData(roomId);

        if (savedRoomData) {
            setVideoStatus(savedRoomData.videoStatus);
            setVideoSrc(savedRoomData.videoSrc);
            setHasUserInteracted(true);
        }
    }, [roomId]);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!socket || !videoElement) return;

        const handlePlay = () => {
            if (admin === 'admin') {
                socket.emit('video-control', {
                    action: 'play',
                    currentTime: videoElement.currentTime,
                    roomId,
                    videoSrc
                });
            }
            saveRoomData(roomId, { videoStatus: 'play', currentTime: videoElement.currentTime, videoSrc });
        };

        const handlePause = () => {
            if (admin === 'admin') {
                socket.emit('video-control', {
                    action: 'pause',
                    currentTime: videoElement.currentTime,
                    roomId,
                    videoSrc
                });
            }
            saveRoomData(roomId, { videoStatus: 'pause', currentTime: videoElement.currentTime, videoSrc });
        };

        const handleSeek = () => {
            if (admin === 'admin') {
                socket.emit('video-control', {
                    action: 'seek',
                    currentTime: videoElement.currentTime,
                    roomId,
                    videoSrc
                });
            }
            saveRoomData(roomId, { videoStatus: videoElement.paused ? 'pause' : 'play', currentTime: videoElement.currentTime, videoSrc });
        };

        // Listen for video control events from the server
        socket.on('video-control', (data) => {
            const { action, currentTime, videoSrc: newVideoSrc } = data;

            if (videoSrc !== newVideoSrc) {
                setVideoSrc(newVideoSrc);
                videoElement.load();
            }

            if (videoElement.currentTime !== currentTime) {
                videoElement.currentTime = currentTime;
            }

            if (action === 'play') {
                videoElement.play().catch(error => console.error("Play failed:", error));
            } else if (action === 'pause') {
                videoElement.pause();
            }

            saveRoomData(roomId, { videoStatus: action, currentTime, videoSrc: newVideoSrc });
        });

        socket.on('video-initial-state', (data) => {
            setVideoStatus(data);
            setHasUserInteracted(true);
            saveRoomData(roomId, data);
        });

        socket.on('video-new-source', (newVideoSrc) => {
            setVideoSrc(newVideoSrc);
            saveRoomData(roomId, { videoStatus, currentTime: videoElement.currentTime, videoSrc: newVideoSrc });
            videoElement.load();
        });

        // Attach event listeners to the video element
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('seeked', handleSeek);

        // Restore video state after reload
        const savedRoomData = getRoomData(roomId);

        if (savedRoomData) {
            videoElement.currentTime = savedRoomData.currentTime || 0;
            if (savedRoomData.videoStatus === 'play') {
                videoElement.play().catch(error => console.error("Play failed:", error));
            }
        }

        return () => {
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('seeked', handleSeek);
            socket.off('video-control');
            socket.off('video-initial-state');
            socket.off('video-new-source');
        };
    }, [socket, videoSrc, admin, roomId]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('video', file);

            fetch('http://localhost:3000/api/upload/upload', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.filePath) {
                        setVideoSrc(data.filePath);
                        saveRoomData(roomId, { videoStatus, currentTime: videoRef.current.currentTime, videoSrc: data.filePath });
                        videoRef.current.load();
                        socket.emit('video-new-source', { videoSrc: data.filePath, roomId: roomId });
                    } else {
                        console.error('Error uploading video:', data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error uploading video:', error);
                });
        }
    };

    return (
        <div className="video-player">
            <video
                ref={videoRef}
                id="videoStream"
                controls
                style={{ display: hasUserInteracted ? 'block' : 'none' }}
                src={videoSrc}
            >
                Your browser does not support the video tag.
            </video>

            {admin === 'admin' && (
                <input
                    type="file"
                    id="fileInput"
                    accept="video/*"
                    onChange={handleFileChange}
                    style={{ display: hasUserInteracted ? 'block' : 'none' }}
                />
            )}
        </div>
    );
};

export default VideoPlayer;
