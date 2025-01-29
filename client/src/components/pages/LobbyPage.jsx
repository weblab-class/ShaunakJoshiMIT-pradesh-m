import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
import { UserContext } from "../App";
import "../styles/LobbyPage.css";
import { SocketContext } from "../modules/SocketContext.jsx";
import CommandHints from "../modules/CommandHints.jsx";

const LobbyPage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [lobby, setLobby] = useState(null);
  const { decoded } = useContext(UserContext);
  const nickname = decoded?.nickname || "anonymous";

  useEffect(() => {
    socket.emit("joinLobby", lobbyCode, nickname);
    socket.on("updateUsers", (data) => {
      setLobby((prevLobby) => ({
        ...prevLobby,
        user_ids: data.users || (prevLobby ? prevLobby.user_ids : []),
        host_id: data.host_id || (prevLobby ? prevLobby.host_id : null),
      }));
    });
    socket.on("lobbyData", (lobbyData) => {
      setLobby(lobbyData);
    });
    socket.on("gameStarted", ({ lobbyCode, game }) => {
      console.log(lobbyCode);
      navigate(`/game/${lobbyCode}`);
    });
    return () => {
      socket.emit("leaveLobby", lobbyCode, nickname);
      socket.off("updateUsers");
      socket.off("lobbyData");
      socket.off("gameStarted");
    };
  }, [lobbyCode, nickname, navigate, socket]);

  const users = lobby?.user_ids || [];
  const host = lobby?.host_id || (users.length ? users[0] : null);

  // Define the commands specific to LobbyPage
  const commands = [
    "leave lobby <code>",
    "time <minutes>",
    "grid <3|9>"
  ];

  return (
    <Layout currentPage="lobby">
      <div className="lobby-page">
        <div className="lobby-container">
          <h1 className="lobby-title">Lobby: {lobbyCode}</h1>
          {host && (
            <h2 className="lobby-host">
              Host: <span className="host-name">{host}</span>
            </h2>
          )}
          <div className="lobby-users">
            <h2>Users in Lobby</h2>
            {users.length === 0 ? (
              <p className="no-users">No users in lobby</p>
            ) : (
              <ul className="users-list">
                {users.map((user, index) => (
                  <li key={index} className="user-item">
                    {user} {user === host && <span className="host-badge">(Host)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lobby && (
            <div className="lobby-settings">
              <h3>Current Lobby Settings</h3>
              <p>Time Limit: <span>{lobby.timeLimit || 10}</span> minute(s)</p>
              <p>Grid Size: <span>{lobby.gridSize || 3} x {lobby.gridSize || 3}</span></p>
            </div>
          )}
        </div>
      </div>
      <CommandHints commands={commands} />
    </Layout>
  );
};

export default LobbyPage;
