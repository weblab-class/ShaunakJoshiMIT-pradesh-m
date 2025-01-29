import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout.jsx";
import "../styles/ProfilePage.css";
import { UserContext } from "../App.jsx";
import { get } from "../../utilities";
import { SocketContext } from "../modules/SocketContext.jsx";
import CommandHints from "../modules/CommandHints.jsx";

const ProfilePage = () => {
  const { userId } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    get("/api/user", { userid: userId })
      .then((userObj) => {
        setUser(userObj);
        console.log("User data updated:", userObj);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId]);

  useEffect(() => {
    const handleUserDataUpdated = (data) => {
      if (data.userid === userId) {
        get("/api/user", { userid: userId })
          .then((userObj) => {
            setUser(userObj);
            console.log("User data updated via socket:", userObj);
          })
          .catch((error) => {
            console.error("Error fetching updated user data:", error);
          });
      }
    };

    socket.on("userDataUpdated", handleUserDataUpdated);

    return () => {
      socket.off("userDataUpdated", handleUserDataUpdated);
    };
  }, [userId, socket]);

  const generateBinaryDigits = (count) => {
    return Array.from({ length: count }, () => Math.round(Math.random()));
  };

  const generateBinaryStreams = (numberOfStreams, digitsPerStream) => {
    return Array.from({ length: numberOfStreams }, (_, i) => (
      <div className="binary-stream" key={i} style={{ left: `${10 + i * 8}%` }}>
        {generateBinaryDigits(digitsPerStream).map((digit, j) => (
          <span key={j}>{digit}</span>
        ))}
      </div>
    ));
  };

  const numberOfStreams = 10;
  const digitsPerStream = 50;

  const commands = [
    "cd home",
    "cd friends",
    "cd settings"
  ];

  if (!user) {
    return (
      <Layout currentPage="profile">
        <div className="profile-container">
          <div className="binary-rain">
            {generateBinaryStreams(numberOfStreams, digitsPerStream)}
          </div>

          <div className="scan-lines"></div>

          <div className="binary-overlay"></div>

          <div className="loading">Loading...</div>
        </div>
        <CommandHints commands={commands} />
      </Layout>
    );
  }

  const totalGames = (user.wins || 0) + (user.losses || 0);
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : 0;

  return (
    <Layout currentPage="profile">
      <div className="profile-container">
        <div className="binary-rain">
          {generateBinaryStreams(numberOfStreams, digitsPerStream)}
        </div>
        <div className="scan-lines"></div>
        <div className="binary-overlay"></div>

        <header className="profile-header">
          <h1>User Profile</h1>
        </header>

        <section className="user-info-section">
          <h2>Basic Information</h2>
          <div className="user-info">
            <p><strong>Nickname:</strong> {user.nickname || 'N/A'}</p>
            <p><strong>Wins:</strong> {user.wins || 0}</p>
            <p><strong>Losses:</strong> {user.losses || 0}</p>
            <p><strong>Win Rate:</strong> {winRate}%</p>
          </div>
        </section>
      </div>
      <CommandHints commands={commands} />
    </Layout>
  );
};

export default ProfilePage;
