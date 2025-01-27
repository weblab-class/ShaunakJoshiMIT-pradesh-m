import React, { useState, useEffect } from "react";

const PhaseTimer = ({ phaseEndTime }) => {
  const calculateTimeLeft = () => {
    const difference = phaseEndTime - Date.now();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        seconds: Math.floor((difference / 1000) % 60),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseEndTime]);

  const timerComponents = [];

  if (timeLeft.minutes !== undefined && timeLeft.minutes > 0) {
    timerComponents.push(
      <span key="minutes">
        {timeLeft.minutes}m{" "}
      </span>
    );
  }

  if (timeLeft.seconds !== undefined) {
    timerComponents.push(
      <span key="seconds">
        {timeLeft.seconds}s
      </span>
    );
  }

  return (
    <div className="phase-timer">
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

export default PhaseTimer;
