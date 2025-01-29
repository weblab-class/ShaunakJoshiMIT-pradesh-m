import React from "react";
import "../styles/sidebar.css";
import "../styles/HackerSidebar.css";

export default function HackerSidebar({ gameObj }) {
  const currentLocation = gameObj.location || "0-0";
  const adjacentNodes = gameObj.edges
    .filter(e => e.source === currentLocation || e.target === currentLocation)
    .map(e => (e.source === currentLocation ? e.target : e.source));
  const uniqueAdjacentNodes = [...new Set(adjacentNodes)];
  return (
    <div className="sidebar hacker-sidebar">
      <h2>Hacker Control Panel</h2>
      <section className="current-location">
        <h3>Current Location</h3>
        <p>{currentLocation}</p>
      </section>
      <section className="available-moves">
        <h3>Available Moves</h3>
        {uniqueAdjacentNodes.length > 0 ? (
          <ul>
            {uniqueAdjacentNodes.map(nodeId => (
              <li key={nodeId}>
                <span className="node-id">{nodeId}</span>
                <span className="command">Command: <code>move {nodeId}</code></span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No available moves from this node.</p>
        )}
      </section>
      <section className="instructions">
        <h3>How to Move</h3>
        <p>Use <code>move &lt;node-id&gt;</code> to move.</p>
      </section>
    </div>
  );
}
