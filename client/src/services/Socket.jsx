import React, { createContext } from 'react';

export const SocketContext = createContext(null);

export const SocketProvider = ({ socket, children }) => {
    // console.log("socket : ", socket);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};




