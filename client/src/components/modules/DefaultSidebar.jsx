import React from "react";
import PropTypes from "prop-types";
import "../styles/DefaultSidebar.css";

const DefaultSidebar = ({ gameObj, currentUserNickname }) => {
  const currentPresidentNickname = gameObj.turnOrder[gameObj.currTurn];
  const players = gameObj.user_ids; 

  return (
    <div className="default-sidebar">
      <h2>Game Overview</h2>

      <section className="current-president">
        <h3>Current President</h3>
        <p>{currentPresidentNickname}</p>
      </section>

      <section className="players-list">
        <h3>Players in the Game</h3>
        <ul>
          {players.map((playerNickname) => (
            <li
              key={playerNickname}
              className={
                playerNickname === currentUserNickname
                  ? "current-user"
                  : ""
              }
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
        <p>
          Please wait for the current president to appoint a hacker. Use the
          terminal to interact with the game.
        </p>
      </section>
    </div>
  );
};

DefaultSidebar.propTypes = {
  gameObj: PropTypes.shape({
    turnOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
    currTurn: PropTypes.number.isRequired,
    user_ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  currentUserNickname: PropTypes.string.isRequired,
};

export default DefaultSidebar;
