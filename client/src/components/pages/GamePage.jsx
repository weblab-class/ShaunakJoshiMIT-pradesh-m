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
import CommandHints from "../components/CommandHints.jsx"; // Added import

export default function GamePage() {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [gameObj, setGameObj] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });
  const [role, setRole] = useState(null);
  const prevPhaseRef = useRef(null);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    function handleGameCreated(data) {
      setGameObj(data.game);
      setError(null);
    }
    socket.on("gameStarted", handleGameCreated);
    return () => {
      socket.off("gameStarted", handleGameCreated);
    };
  }, [socket]);

  useEffect(() => {
    if (!lobbyCode) {
      navigate("/home");
      return;
    }
    get("/api/user", { userid: userId }).then(u => {
      setUser(u);
      socket.emit("joinLobby", lobbyCode, u.nickname);
      get("/api/game/role", { lobbyCode, user_id: userId }).then(r => {
        setRole(r.role);
      });
    });
    socket.emit("getGameData", lobbyCode);
    function handleGameData(data) {
      setGameObj(data);
      setError(null);
    }
    function handleErrorMessage(data) {
      setError(data.message);
    }
    function handleGameStarted(data) {
      setGameObj(data.game);
      setError(null);
    }
    socket.on("gameData", handleGameData);
    socket.on("errorMessage", handleErrorMessage);
    socket.on("gameStarted", handleGameStarted);
    return () => {
      socket.off("gameData");
      socket.off("errorMessage");
      socket.off("gameStarted");
    };
  }, [lobbyCode, userId, socket, navigate]);

  useEffect(() => {
    if (!gameObj || !gameObj.phase) return;
    const prevPhase = prevPhaseRef.current;
    const currentPhase = gameObj.phase.toUpperCase();
    if (prevPhase && currentPhase && prevPhase !== currentPhase) {
      let title = "";
      let content = "";
      if (currentPhase === "APPOINT") {
        if (prevPhase === "VOTE") {
          title = "Appointment Phase";
          content = "The vote failed. The next president, " + gameObj.turnOrder[gameObj.currTurn] + ", is appointing a hacker.";
        } else {
          title = "Appointment Phase";
          content = "The current president, " + gameObj.turnOrder[gameObj.currTurn] + ", is appointing a hacker.";
        }
      } else if (currentPhase === "VOTE") {
        title = "Voting Phase";
        content = gameObj.turnOrder[gameObj.currTurn] + " appointed " + gameObj.appointedHacker + ". Vote to determine if they should hack the next folder.";
      } else if (currentPhase === "MOVE") {
        title = "Move Phase";
        content = "The vote passed! The hacker, " + gameObj.hacker + ", will choose the next folder to hack.";
      } else if (currentPhase === "TRIVIA") {
        title = "Trivia Phase";
        content = "Hacker " + gameObj.hacker + " must successfully hack the next folder, " + gameObj.nextLocation + ".";
      } else if (currentPhase === "END") {
        title = "Game Over";
        content = "The game has ended.";
      }
      if (title && content) {
        setModalContent({ title, content });
        setIsModalOpen(true);
      }
    }
    prevPhaseRef.current = gameObj.phase.toUpperCase();
  }, [gameObj]);

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
  let sidebar;
  if (currentPhase === "END") {
    sidebar = <EndGameScreen gameObj={gameObj} />;
  } else if (currentPhase === "VOTE") {
    sidebar = <VoteSidebar gameObj={gameObj} />;
  } else if (currentPhase === "APPOINT") {
    if (isPresident) {
      sidebar = <AppointmentSidebar gameObj={gameObj} />;
    } else {
      sidebar = <DefaultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
    }
  } else if (currentPhase === "MOVE") {
    if (isHacker) {
      sidebar = <HackerSidebar gameObj={gameObj} />;
    } else {
      sidebar = <DefaultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
    }
  } else if (currentPhase === "TRIVIA") {
    sidebar = <TriviaSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  } else if (currentPhase === "RESULT") {
    sidebar = <ResultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  } else {
    sidebar = <DefaultSidebar gameObj={gameObj} currentUserNickname={userNickname} />;
  }

  const commands = [
    "start game",
    "pause game",
    "end game",
    "cd lobby",
    "cd profile",
    "cd settings"
  ];

  return (
    <Layout currentPage="game">
      <div className="game-page">
        <header className="game-header">
          {gameObj.endTime && currentPhase !== "END" && <GameTimer gameObj={gameObj} />}
          {gameObj.phaseEndTime && currentPhase !== "END" && <PhaseTimer phaseEndTime={gameObj.phaseEndTime} />}
          {role && <div className="user-role">Your Role: {role}</div>}
          <h1>Lobby Code: {lobbyCode}</h1>
        </header>
        <div className="game-main">
          <aside className="game-sidebar">{sidebar}</aside>
          <main className="maze-container">
            <MazeWrapper gameObj={gameObj} />
          </main>
        </div>
        <IntermediateModal
          isOpen={isModalOpen}
          title={modalContent.title}
          content={modalContent.content}
          duration={3000}
          onClose={handleCloseModal}
        />
      </div>
    </Layout>
  );
}
