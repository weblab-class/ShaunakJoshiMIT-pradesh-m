// HackerSidebar.jsx
import React from "react";
import PropTypes from "prop-types";
import "../styles/HackerSidebar.css";

const HackerSidebar = ({ gameObj }) => {
  // Extract hacker's current location
  const currentLocation = gameObj.hackerLocation || "0-0";

  // Find all edges connected to the current location
  const adjacentNodes = gameObj.edges
    .filter(
      (edge) =>
        edge.source === currentLocation || edge.target === currentLocation
    )
    .map((edge) =>
      edge.source === currentLocation ? edge.target : edge.source
    );

  // Remove duplicates if any
  const uniqueAdjacentNodes = [...new Set(adjacentNodes)];

  return (
    <div className="hacker-sidebar">
      <h2>Hacker Control Panel</h2>
      <section className="current-location">
        <h3>Current Location</h3>
        <p>{currentLocation}</p>
      </section>

      <section className="available-moves">
        <h3>Available Moves</h3>
        {uniqueAdjacentNodes.length > 0 ? (
          <ul>
            {uniqueAdjacentNodes.map((nodeId) => (
              <li key={nodeId}>
                <span className="node-id">{nodeId}</span>
                <span className="command">
                  Command: <code>move {nodeId}</code>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No available moves from this node.</p>
        )}
      </section>

      <section className="instructions">
        <h3>How to Move</h3>
        <p>
          Use the terminal command <code>move &lt;node-id&gt;</code> to move to an
          adjacent node.
        </p>
        <p>Example:</p>
        <p>
          <code>move 1-2</code>
        </p>
      </section>
    </div>
  );
};

HackerSidebar.propTypes = {
  gameObj: PropTypes.shape({
    hackerLocation: PropTypes.string,
    edges: PropTypes.arrayOf(
      PropTypes.shape({
        source: PropTypes.string.isRequired,
        target: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default HackerSidebar;
