// GameTimer.jsx
import React, { useEffect, useState } from "react";
import "../styles/GameTimer.css";

const GameTimer = ({ gameObj }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [warning, setWarning] = useState(false); 

  useEffect(() => {
    const endTime = new Date(gameObj.endTime).getTime();

    function updateTimer() {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining <= 60 * 1000) {
        setWarning(true);
      } else {
        setWarning(false);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameObj.endTime]);

  const seconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;

  return (
    <div className={`game-timer ${warning ? "warning" : ""}`}>
      <span className="timer-label">Time Left:</span>
      <span className="timer-value">
        {minutes}:{displaySeconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default GameTimer;
