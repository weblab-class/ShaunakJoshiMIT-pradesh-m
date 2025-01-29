// src/contexts/SocketContext.jsx
import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = io("https://find-the-moles.onrender.com/");

  useEffect(() => {
    console.log("Socket connected:", socket.id);


    return () => {
      console.log("Socket disconnected:", socket.id);
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
