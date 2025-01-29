// AppointmentSidebar.jsx

import React from "react";
import "../styles/AppointmentSidebar.css";
import hackerIcon from "../assets/images/assets/hacker.png"

const AppointmentSidebar = ({ gameObj }) => {
  const currentPresident = gameObj?.turnOrder[gameObj.currTurn] || "Unknown";

  const players = gameObj.user_ids.map((nickname) => (
    <tr key={nickname} className={nickname === currentPresident ? "current-president" : ""}>
      <td>{nickname}</td>
    </tr>
  ));

  return (
    <aside className="appointment-sidebar" aria-label="Appointment Sidebar">
      <div className="appointment-header">
        <img src={hackerIcon} alt="Hacker Icon" className="appointment-icon" />
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
};

export default AppointmentSidebar;
