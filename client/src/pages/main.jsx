import React from 'react';
import Sidebar from '../components/sideBar';
import VideoPlayer from '../components/videoPlayer';
import ChatContainer from '../components/chatContainer';
// import VideoCall from '../components/videoCalling';
import '/public/css/main.css';
import { useLocation } from 'react-router-dom';

const MainLayout = () => {

    const location = useLocation();
    const { username, roomId, admin } = location.state || {};

    return (
        <div className="main-container" style={{ backgroundColor: '#333333', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar roomId={roomId} username={username} admin={admin} />
            <div className="video-section">
                <VideoPlayer roomId={roomId} username={username} admin={admin} />
                {/* <VideoCall /> */}
            </div>
            <ChatContainer roomId={roomId} username={username} admin={admin} />
        </div>
    );
};

export default MainLayout;
