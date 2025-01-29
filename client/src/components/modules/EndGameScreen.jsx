import React from "react";
import "../styles/EndGameScreen.css"; 

const EndGameScreen = ({ gameObj }) => {
  const winner = gameObj.winner || "No winner specified";
  const imposters = gameObj.imposters || [];

  return (
    <div className="end-game-screen">
      <h2>Game Over</h2>
      <p>
        <strong>Winner:</strong> {winner}
      </p>
      <p>
        <strong>Imposters:</strong>{" "}
        {imposters.length ? imposters.join(", ") : "None"}
      </p>
    </div>
  );
};

export default EndGameScreen;
