import React, { useEffect, useState, useContext } from "react";
import Layout from "../Layout.jsx";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { UserContext } from "../App";
import "../styles/LobbyPage.css";

const socket = io("http://localhost:3000");

const LobbyPage = () => {
  const { lobbyCode } = useParams();
  const [users, setUsers] = useState([]);
  const { userId, googleid, decoded } = useContext(UserContext);

  const nickname = decoded?.nickname || ((decoded && decoded.name) ? decoded.name : userId || "anonymous");

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
      <div className="lobby-container">
        <h1 className="lobby-title">Lobby: {lobbyCode}</h1>
        <div className="lobby-users">
          <h2>Users in Lobby</h2>
          {users.length === 0 ? (
            <p className="no-users">No users in lobby</p>
          ) : (
            <ul className="users-list">
              {users.map((user, index) => (
                <li key={index} className="user-item">{user}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LobbyPage;
