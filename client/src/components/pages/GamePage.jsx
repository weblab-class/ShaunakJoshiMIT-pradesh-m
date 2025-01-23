// GamePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import { SocketContext } from "../modules/SocketContext.jsx";

import Layout from "../Layout.jsx";
import MazeWrapper from "../modules/MazeWrapper";
import AppointmentSidebar from "../modules/AppointmentSidebar.jsx";
import VoteSidebar from "../modules/VoteSidebar.jsx";

import "../styles/GamePage.css";

const GamePage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const socket = useContext(SocketContext);

  // Instead of local "which sidebar" booleans, store the entire game object
  const [gameObj, setGameObj] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lobbyCode) {
      // No code → back to home
      console.error("No lobby code provided, redirecting to home");
      navigate("/home");
      return;
    }

    // Join the lobby
    console.log("Joining lobby:", lobbyCode, "userId:", userId);
    socket.emit("joinLobby", lobbyCode, userId);

    // Request initial game data
    socket.emit("getGameData", lobbyCode);

    // Listen for the game data from server
    socket.on("gameData", (data) => {
      console.log("Received game data:", data);
      setGameObj(data);
      setError(null);
    });

    // Optionally listen for error messages
    socket.on("errorMessage", (data) => {
      console.error("Error from server:", data.message);
      setError(data.message);
    });

    // Optionally, if your server still emits this:
    socket.on("gameStarted", (data) => {
      console.log("Game started:", data);
      setGameObj(data.game);
      setError(null);
    });

    // Cleanup on unmount
    return () => {
      socket.off("gameData");
      socket.off("errorMessage");
      socket.off("gameStarted");
    };
  }, [lobbyCode, navigate, socket, userId]);

  // If there's an error, display it
  if (error) {
    return (
      <Layout currentPage="game">
        <div className="error-page">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/home")}>Go Home</button>
        </div>
      </Layout>
    );
  }

  // If we haven't received gameObj yet, show a loading message
  if (!gameObj) {
    return (
      <Layout currentPage="game">
        <div className="loading-page">
          <h2>Loading Game Data...</h2>
        </div>
      </Layout>
    );
  }

  // Decide which sidebar to show based on the server-controlled "phase"
  let sidebar;
  if (gameObj.phase === "VOTE") {
    // If the server has set phase=VOTE, show the vote sidebar
    sidebar = <VoteSidebar gameObj={gameObj} />;
  } else {
    // Otherwise (e.g. phase=APPOINT), show the appointment sidebar
    sidebar = <AppointmentSidebar gameObj={gameObj} />;
  }

  return (
    <Layout currentPage="game">
      <div className="game-page" style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        {/* The dynamic sidebar */}
        {sidebar}

        {/* The Maze area */}
        <div className="maze-container" style={{ flex: 1, position: "relative" }}>
          <MazeWrapper gameObj={gameObj} />
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
