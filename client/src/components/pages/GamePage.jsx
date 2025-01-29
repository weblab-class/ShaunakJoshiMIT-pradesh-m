// GamePage.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
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
import ResultSidebar from "../modules/ResultSidebar.jsx";
import GameTimer from "../modules/GameTimer.jsx";
import EndGameScreen from "../modules/EndGameScreen.jsx";
import IntermediateModal from "../modules/IntermediateModal.jsx";
import { get } from "../../utilities";
import PhaseTimer from "../modules/PhaseTimer.jsx";

import "../styles/GamePage.css";

const GamePage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const socket = useContext(SocketContext);

  const [gameObj, setGameObj] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
  });

  const [role, setRole] = useState(null);

  const prevPhaseRef = useRef(null);

  useEffect(() => {
    if (!lobbyCode) {
      console.error("No lobby code provided, redirecting to home");
      navigate("/home");
      return;
    }

    console.log("Joining lobby:", lobbyCode, "userId:", userId);
    socket.emit("joinLobby", lobbyCode, userId);

    socket.emit("getGameData", lobbyCode);

    socket.on("gameData", (data) => {
      console.log("Received game data:", data);
      setGameObj(data);
      setError(null);
    });

    socket.on("errorMessage", (data) => {
      console.error("Error from server:", data.message);
      setError(data.message);
    });

    socket.on("gameStarted", (data) => {
      console.log("Game started:", data);
      setGameObj(data.game);
      setError(null);
    });

    get("/api/user", { userid: userId })
      .then((userObj) => {
        setUser(userObj);
      })
      .catch((err) => {
        console.error("User Not Found");
      });
    get("/api/game/role", { lobbyCode, user_id: userId }).then((data) => {
      setRole(data.role);
    }).catch(error => {
      console.error("Error in /role:", error);
    });

    return () => {
      socket.off("gameData");
      socket.off("errorMessage");
      socket.off("gameStarted");
    };
  }, );

  // Stable onClose function using useCallback
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // useEffect to handle phase changes
  useEffect(() => {
    if (!gameObj || !gameObj.phase) return;

    const prevPhase = prevPhaseRef.current;
    const currentPhase = gameObj.phase.toUpperCase();

    if (prevPhase && currentPhase && prevPhase !== currentPhase) {
      let title = "";
      let content = "";

      switch (currentPhase) {
        case "APPOINT":
          if (prevPhase === "VOTE") {
            title = "Appointment Phase";
            content = `The vote failed. The next president, ${gameObj.turnOrder[gameObj.currTurn]}, is appointing a hacker.`;
          } else {
            title = "Appointment Phase";
            content = `The current president, ${gameObj.turnOrder[gameObj.currTurn]}, is appointing a hacker.`;
          }
          break;
        case "VOTE":
          title = "Voting Phase";
          content = `${gameObj.turnOrder[gameObj.currTurn]} appointed ${gameObj.appointedHacker}. Vote to determine if they should hack the next folder.`;
          break;
        case "MOVE":
          title = "Move Phase";
          content = `The vote passed! The hacker, ${gameObj.hacker}, will choose the next folder to hack.`;
          break;
        case "TRIVIA":
          title = "Trivia Phase";
          content = `Hacker ${gameObj.hacker} must successfully hack the next folder, ${gameObj.nextLocation}.`;
          break;
        case "END":
          title = "Game Over";
          content = `The game has ended.`;
          break;
        default:
          break;
      }

      if (title && content) {
        setModalContent({ title, content });
        setIsModalOpen(true);
      }
    }

    // Update prevPhaseRef.current after handling
    prevPhaseRef.current = gameObj.phase.toUpperCase();
  }, [gameObj]);

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
  const isPresident = userNickname === currentPresidentNickname;

  const currentPhase = gameObj.phase.toUpperCase();
  const isHacker = userNickname === gameObj.hacker;
  console.log(userNickname, currentPresidentNickname);

  let sidebar;
  if (currentPhase === "END") {
    sidebar = <EndGameScreen gameObj={gameObj} />;
  } else if (currentPhase === "VOTE") {
    sidebar = <VoteSidebar gameObj={gameObj} />;
  } else if (currentPhase === "APPOINT") {
    sidebar = isPresident
      ? <AppointmentSidebar gameObj={gameObj} />
      : <DefaultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  } else if (currentPhase === "MOVE") {
    sidebar = isHacker
      ? <HackerSidebar gameObj={gameObj} />
      : <DefaultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  } else if (currentPhase === "TRIVIA") {
    sidebar = <TriviaSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  } else if (currentPhase === "RESULT") {
    sidebar = <ResultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
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
      <div className="game-page">
        <header className="game-header">
          {gameObj.endTime && currentPhase !== "END" && (
            <GameTimer gameObj={gameObj} />
          )}
          {gameObj.phaseEndTime && currentPhase !== "END" && (
            <PhaseTimer phaseEndTime={gameObj.phaseEndTime} />
          )}
          {role && (
            <div className="user-role">
              <strong>Your Role:</strong> {role}
            </div>
          )}
          <h1>Lobby Code: {lobbyCode}</h1>
        </header>

        <div className="game-main">
          <aside className="game-sidebar">
            {sidebar}
          </aside>

          <main className="maze-container">
            <MazeWrapper gameObj={gameObj} />
          </main>
        </div>

        {/* Intermediate Modal */}
        <IntermediateModal
          isOpen={isModalOpen}
          title={modalContent.title}
          content={modalContent.content}
          duration={5000} // Modal will close after 5 seconds (5000ms)
          onClose={handleCloseModal}
        />
      </div>
    </Layout>
  );
};

export default GamePage;
