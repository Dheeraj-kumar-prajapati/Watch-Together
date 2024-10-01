import React, { useEffect, useRef, useState, useContext } from 'react';
import { SocketContext } from '../services/Socket';
import '/public/css/videCalling.css';

const VideoCall = () => {
    const socket = useContext(SocketContext);
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const peerConnections = useRef({}); 
    const localStreamRef = useRef(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    useEffect(() => {
        const initLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                return stream;
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };



        const handleNewUser = async (newUserId, roomId) => {
            console.log('Handling new user:', newUserId);
            const pc = createPeerConnection(newUserId, roomId);

            // Add local tracks to the new peer connection
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

            // Create an offer and set it
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Emit the offer to the new user
            socket.emit('offer', { offer, targetUserId: newUserId, roomId });
        };






        const createPeerConnection = (newUserId, roomId) => {
            console.log(3);
            const pc = new RTCPeerConnection();
            peerConnections.current[newUserId] = pc;

            pc.ontrack = (event) => {
                const remoteStream = event.streams[0];
                if (remoteVideosRef.current[newUserId]) {
                    remoteVideosRef.current[newUserId].srcObject = remoteStream;
                } else {
                    // Create a new video element for the remote user
                    const videoElem = document.createElement('video');
                    videoElem.srcObject = remoteStream;
                    videoElem.autoplay = true;
                    videoElem.style.width = '250px';
                    videoElem.style.height = '150px';
                    document.getElementById('remote_videos').appendChild(videoElem);
                    remoteVideosRef.current[newUserId] = videoElem;
                    console.log("connection done");
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { candidate: event.candidate, roomId, targetUserId: newUserId });
                }
            };

            return pc;
        };

        initLocalStream().then((stream) => {
            if (socket) {
                socket.on('user-joined', ({ newUserId, roomId }) => {
                    console.log("1");
                    handleNewUser(newUserId, roomId);
                });

                socket.on('offer', async ({ offer, senderId }) => {
                    const pc = createPeerConnection(senderId);
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('answer', { answer, targetUserId: senderId });
                });

                socket.on('answer', async ({ answer, senderId }) => {
                    const pc = peerConnections.current[senderId];
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                });

                socket.on('ice-candidate', async ({ candidate, senderId }) => {
                    const pc = peerConnections.current[senderId];
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                });
            }
        });

        return () => {
            // Cleanup on component unmount
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            Object.keys(peerConnections.current).forEach((key) => {
                peerConnections.current[key].close();
                delete peerConnections.current[key];
            });

            if (socket) {
                socket.off('user-joined');
                socket.off('offer');
                socket.off('answer');
                socket.off('ice-candidate');
            }
        };
    }, [socket]);

    const toggleVideo = () => {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const toggleMic = () => {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    return (
        <div id="calling_box">
            <video ref={localVideoRef} autoPlay muted id="videoBox" />

            <div id="remote_videos"></div> {/* Dynamic remote videos */}

            <div id="controls" style={{ display: "flex" }}>
                <button onClick={toggleVideo} className='btn'>
                    {isVideoOn ? <i className="fa-solid fa-video"></i> : <i className="fa-solid fa-video-slash"></i>}
                </button>
                <button onClick={toggleMic} className='btn'>
                    {isMicOn ? <i className="fa-solid fa-microphone"></i> : <i className="fa-solid fa-microphone-slash"></i>}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
