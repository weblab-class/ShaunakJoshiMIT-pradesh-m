// src/contexts/SocketContext.jsx
import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const dev = import.meta.env.MODE === "development";
  const socketURL = dev
    ? "http://localhost:3000"                  // local
    : "https://find-the-moles.onrender.com";   // production

  const socket = io(socketURL, {
    withCredentials: true, // if you need cookies
  });


  useEffect(() => {
    console.log("Socket connected:", socket.id);


    return () => {
      console.log("Socket disconnected:", socket.id);
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
