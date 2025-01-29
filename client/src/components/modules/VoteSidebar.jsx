import React, { useContext, useState, useEffect } from "react";
import "../styles/sidebar.css";
import "../styles/VoteSidebar.css";
import voteIcon from "../assets/images/votingIcon.png";
import clockIcon from "../assets/images/clock.png";
import check from "../assets/images/check.png";
import noIcon from "../assets/images/noIcon.png";
import { SocketContext } from "./SocketContext.jsx";

export default function VoteSidebar({ gameObj }) {
  const socket = useContext(SocketContext);
  const [game, setGame] = useState(gameObj);

  useEffect(() => {
    function handleGameData(updatedGame) {
      setGame(updatedGame);
    }
    socket.on("gameData", handleGameData);
    return () => {};
  }, [socket]);

  const players = game.user_ids.map(nickname => {
    const decision = game.votes?.[nickname] || null;
    let iconSrc = clockIcon;
    if (decision === "yes") iconSrc = check;
    if (decision === "no") iconSrc = noIcon;
    return (
      <tr key={nickname} className={nickname === game.appointedHacker ? "appointed-hacker" : ""}>
        <td>{nickname}</td>
        <td>
          <img src={iconSrc} alt="" className="vote-icon" />
        </td>
      </tr>
    );
  });
  return (
    <aside className="sidebar vote-sidebar">
      <div className="vote-header">
        <img src={voteIcon} alt="" className="vote-icon" />
        <h2>Vote on Appointed Hacker</h2>
      </div>
      <div className="vote-content">
        <p>Hacker: <strong className="appointee-name">{game.appointedHacker}</strong></p>
        <p>Use the terminal to cast your vote:</p>
        <p><code>vote yes</code> or <code>vote no</code></p>
      </div>
      <div className="player-section">
        <h3>Players</h3>
        <table className="player-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Vote</th>
            </tr>
          </thead>
          <tbody>{players}</tbody>
        </table>
      </div>
    </aside>
  );
}
