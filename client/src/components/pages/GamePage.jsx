// GamePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import { SocketContext } from "../modules/SocketContext.jsx";

import Layout from "../Layout.jsx";
import MazeWrapper from "../modules/MazeWrapper";
import AppointmentSidebar from "../modules/AppointmentSidebar.jsx";
import VoteSidebar from "../modules/VoteSidebar.jsx";
import DefaultSidebar from "../modules/DefaultSidebar.jsx";
import HackerSidebar from "../modules/HackerSidebar.jsx";
import TriviaSidebar from "../modules/TriviaSidebar.jsx";
import { get } from "../../utilities";

import "../styles/GamePage.css";

const GamePage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const socket = useContext(SocketContext);

  const [gameObj, setGameObj] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!lobbyCode) {
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
    get("/api/user", { userid: userId }).then((user) => {
      setUser(user);
    });
    // Cleanup on unmount
    return () => {
      socket.off("gameData");
      socket.off("errorMessage");
      socket.off("gameStarted");
    };
  }, [socket, lobbyCode, userId, navigate, ]);

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

  const userNickname = user?.nickname || "anonymous";
  const currentPresidentNickname = gameObj.turnOrder[gameObj.currTurn];
  const isPresident = (userNickname === currentPresidentNickname);

  const currentPhase = gameObj.phase;
  const isHacker = userNickname === gameObj.hacker;
  console.log(userNickname, currentPresidentNickname)

  let sidebar;
  if (currentPhase === "VOTE") {
    // Show VoteSidebar to all players
    sidebar = <VoteSidebar gameObj={gameObj} />;
  } else if (currentPhase === "APPOINT") {
    if (isPresident) {
      // Only the president sees AppointmentSidebar
      sidebar = <AppointmentSidebar gameObj={gameObj} />;
    } else {
      // Others see DefaultSidebar
      sidebar = (
        <DefaultSidebar
          gameObj={gameObj}
          currentUserNickname={userNickname}
        />
      );
    }
  } else if (currentPhase === "MOVE") {
    if (isHacker) {
      sidebar = <HackerSidebar gameObj={gameObj} />;
    } else {
      sidebar = (
        <DefaultSidebar
          gameObj={gameObj}
          currentUserNickname={userNickname}
        />
      );
    }
  } else if (currentPhase === "TRIVIA") {
    sidebar = (
      <TriviaSidebar gameObj={gameObj} currentUserNickname={userNickname} />
    );
  } else {
    sidebar = (
      <DefaultSidebar
        gameObj={gameObj}
        currentUserNickname={userNickname}
      />
    );
  }

  return (
    <Layout currentPage="game">
      <div className="game-page" style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        {sidebar}

        <div className="maze-container" style={{ flex: 1, position: "relative" }}>
          <MazeWrapper gameObj={gameObj} />
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
