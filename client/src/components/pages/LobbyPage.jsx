import React, { useEffect, useState, useContext } from "react";
import Layout from "../Layout.jsx";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { UserContext } from "../App";

const socket = io("http://localhost:3000");

const LobbyPage = () => {
  const { lobbyCode } = useParams();
  const [users, setUsers] = useState([]);
  const { userId, decoded } = useContext(UserContext);

  // retrieve the nickname from localStorage.
  // if none is set, fall back to the default username.
  const nickname = localStorage.getItem("nickname") || ((decoded && decoded.name) ? decoded.name : userId || "anonymous");

  useEffect(() => {
    socket.emit("joinLobby", lobbyCode, nickname);

    socket.on("updateUsers", (data) => {
      console.log("Received update:", data);
      setUsers(data.users || []);
    });

    return () => {
      socket.emit("leaveLobby", lobbyCode, nickname);
      socket.off("updateUsers");
    };
  }, [lobbyCode, nickname]);

  return (
    <Layout currentPage="lobby">
      <div>
        <h1>Lobby: {lobbyCode}</h1>
        <h2>Users in Lobby:</h2>
        {users.length === 0 ? (
          <p>No users in lobby</p>
        ) : (
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default LobbyPage;