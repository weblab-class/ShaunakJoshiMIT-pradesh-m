import React from "react";
import "../styles/sidebar.css";
import "../styles/AppointmentSidebar.css";
import siteLogo from "../assets/images/site-logo.png";

export default function AppointmentSidebar({ gameObj }) {
  const currentPresident = gameObj.turnOrder[gameObj.currTurn] || "Unknown";
  const players = gameObj.user_ids.map(nickname => (
    <tr key={nickname} className={nickname === currentPresident ? "current-president" : ""}>
      <td>{nickname}</td>
    </tr>
  ));
  return (
    <aside className="sidebar appointment-sidebar">
      <div className="appointment-header">
        <img src={siteLogo} alt="Site Logo" className="appointment-icon" />
        <h2>
          Current President: <span className="president-name">{currentPresident}</span>
        </h2>
      </div>
      <div className="appointment-content">
        <p>It's the president's turn to appoint a hacker.</p>
        <p>Use the terminal to appoint a user:</p>
        <p>
          <code>appoint &lt;nickname&gt;</code>
        </p>
        <p>Awaiting appointment...</p>
      </div>
      <div className="player-section">
        <h3>Players</h3>
        <table className="player-table">
          <thead>
            <tr>
              <th>Player Nickname</th>
            </tr>
          </thead>
          <tbody>{players}</tbody>
        </table>
      </div>
    </aside>
  );
}
