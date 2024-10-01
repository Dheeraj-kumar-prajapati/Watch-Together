import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homePage';
import JoinRoom from './pages/joinRoom';
import Main from './pages/main';
import { io } from 'socket.io-client';
import { SocketProvider } from './services/Socket';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to the Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);


  return (
    <SocketProvider socket={socket}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/video" element={<Main />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
