// GamePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import MazeWrapper from "../modules/MazeWrapper";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/GamePage.css";
import AppointmentModal from "../modules/AppointmentModal";
import VoteModal from "../modules/VoteModal.jsx";
import { SocketContext } from "../modules/SocketContext.jsx";
import Layout from "../Layout.jsx";

const GamePage = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { userId } = useContext(UserContext);

  const [gameObj, setGameObj] = useState(null);
  const [error, setError] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [appointee, setAppointee] = useState(null);

  useEffect(() => {
    console.log("GamePage mounted with lobbyCode:", lobbyCode);
    if (!lobbyCode) {
      navigate("/home");
      console.error("No lobby code provided, redirecting to home");
      return;
    }

    // Emit event to get game data
    socket.emit("getGameData", lobbyCode);
    console.log("Emitted 'getGameData' event with lobbyCode:", lobbyCode);

    // Listen for gameData
    socket.on("gameData", (data) => {
      console.log("Received game data:", data);
      setGameObj(data);
      setError(null);
    });

    // Listen for errorMessage
    socket.on("errorMessage", (data) => {
      console.error("Error from server:", data.message);
      setError(data.message);
    });

    // Optionally, listen for 'gameStarted' if you want real-time updates
    socket.on("gameStarted", (data) => {
      console.log("Game started:", data);
      setGameObj(data.game);
      setError(null);
    });

    socket.on("appointed", (data) => {
        if (showAppointmentModal) {
            setShowAppointmentModal(false);
            console.log("appointed", data);
            socket.emit("nextTurn", lobbyCode);
            setAppointee(data);
            setShowVoteModal(true);
        }
    })

    return () => {
      socket.off("gameData");
      socket.off("errorMessage");
      socket.off("gameStarted");
    };
  }, [lobbyCode, navigate, socket]);

  console.log("gameObj:", gameObj);

  const modal = (showAppointmentModal) ? (
    <AppointmentModal gameObj={gameObj} />) : (<VoteModal gameObj={gameObj} appointee={appointee} />)

  if (error) {
    return (
      <Layout currentPage="game">
        <div className="error-page">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/home")}>Go to Home</button>
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

  return (
    <Layout currentPage="game">
      <div className="game-page" style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        {/* Appointment Modal Sidebar */}
        {/* <AppointmentModal gameObj={gameObj} users = {gameObj.user_ids}/> */}
        {modal}

        {/* Maze Section */}
        <div className="maze-container" style={{ flex: 1, position: 'relative' }}>
          <MazeWrapper gameObj={gameObj} />
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
