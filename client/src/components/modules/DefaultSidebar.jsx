import React from "react";
import "../styles/Sidebar.css";
import "../styles/DefaultSidebar.css";

export default function DefaultSidebar({ gameObj, currentUserNickname }) {
  const currentPresidentNickname = gameObj.turnOrder[gameObj.currTurn];
  return (
    <div className="sidebar default-sidebar">
      <h2>Game Overview</h2>
      <section className="current-president">
        <h3>Current President</h3>
        <p>{currentPresidentNickname}</p>
      </section>
      <section className="players-list">
        <h3>Players in the Game</h3>
        <ul>
          {gameObj.user_ids.map(playerNickname => (
            <li
              key={playerNickname}
              className={playerNickname === currentUserNickname ? "current-user" : ""}
            >
              {playerNickname}
              {playerNickname === currentPresidentNickname && (
                <span className="role-badge">President</span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="instructions">
        <h3>Instructions</h3>
        <p>Please wait for the current president to appoint a hacker. Use the terminal to interact.</p>
      </section>
    </div>
  );
}