import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../services/Socket';
import { useLocation } from 'react-router-dom';
import '/public/css/chatContainer.css';

const ChatContainer = () => {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const location = useLocation();
    const { username, roomId } = location.state || {};

    const chatMessagesRef = useRef(null);

    // Load saved messages from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem(`chat_${roomId}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [roomId]);

    useEffect(() => {
        if (socket) {
            socket.emit('joinRoom', { roomId, username });

            socket.on('message', (message) => {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, { ...message, isSender: message.user === username }];

                    // Save messages to localStorage whenever a new message is received
                    localStorage.setItem(`chat_${roomId}`, JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            });

            return () => {
                socket.off('message');
            };
        }
    }, [socket, roomId, username]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit('sendMessage', { roomId, message: newMessage, username });
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat</h3>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.user === 'admin' ? 'announcement' : `${message.isSender ? 'sent' : 'received'}`
                            }`}
                    >
                        {message.user !== 'admin' && (
                            <strong>{message.user}: </strong>
                        )}
                        {message.text}
                    </div>

                ))}
            </div>
            <div className="chat-input">
                <form onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatContainer;
