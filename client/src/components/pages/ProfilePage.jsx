// ProfilePage.jsx

import React, { useState, useContext, useEffect } from "react";
import Layout from "../Layout.jsx";
import "../styles/ProfilePage.css";
import { UserContext } from "../App.jsx";
import { get } from "../../utilities";
import { SocketContext } from "../modules/SocketContext.jsx";

const ProfilePage = () => {
  const { userId } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Fetch user data based on userId
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
    // Listen for user data update event
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

  // Function to generate binary digits
  const generateBinaryDigits = (count) => {
    return Array.from({ length: count }, () => Math.round(Math.random()));
  };

  // Function to generate binary streams
  const generateBinaryStreams = (numberOfStreams, digitsPerStream) => {
    return Array.from({ length: numberOfStreams }, (_, i) => (
      <div className="binary-stream" key={i} style={{ left: `${10 + i * 8}%` }}>
        {generateBinaryDigits(digitsPerStream).map((digit, j) => (
          <span key={j}>{digit}</span>
        ))}
      </div>
    ));
  };

  // Define number of streams and digits per stream based on screen size
  const numberOfStreams = 10; // Adjust as needed (e.g., 10 streams covering ~80% width)
  const digitsPerStream = 50; // Adjust to ensure coverage of viewport height

  if (!user) {
    return (
      <Layout currentPage="profile">
        <div className="profile-container">
          {/* Binary Rain Background */}
          <div className="binary-rain">
            {generateBinaryStreams(numberOfStreams, digitsPerStream)}
          </div>

          {/* Scan Lines Overlay */}
          <div className="scan-lines"></div>

          {/* Binary Rain Overlay (Optional for Depth) */}
          <div className="binary-overlay"></div>

          {/* Loading Indicator */}
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Calculate win rate (avoid division by 0)
  const totalGames = (user.wins || 0) + (user.losses || 0);
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : 0;

  return (
    <Layout currentPage="profile">
      <div className="profile-container">
        {/* Binary Rain Background */}
        <div className="binary-rain">
          {generateBinaryStreams(numberOfStreams, digitsPerStream)}
        </div>

        {/* Scan Lines Overlay */}
        <div className="scan-lines"></div>

        {/* Binary Rain Overlay (Optional for Depth) */}
        <div className="binary-overlay"></div>

        {/* Existing Content */}
        <header className="profile-header">
          <h1>User Profile</h1>
        </header>

        <section className="user-info-section">
          <h2>Basic Information</h2>
          <div className="user-info">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Nickname:</strong> {user.nickname || 'N/A'}</p>
            <p><strong>Wins:</strong> {user.wins || 0}</p>
            <p><strong>Losses:</strong> {user.losses || 0}</p>
            <p><strong>Win Rate:</strong> {winRate}%</p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProfilePage;
