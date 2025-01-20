// GamePage.jsx
import React from "react";
import Terminal from "../modules/terminal";
import MazeWrapper from "../modules/MazeWrapper";
import "./GamePage.css";




const GamePage = () => {
    return (
        <div className="game-page">
            {/* Maze Section: Flexible to occupy remaining space */}
            <div className="maze-container">
                <MazeWrapper rows={10} cols={10} />
            </div>

            {/* Terminal Section: Fixed height */}
            <div className="terminal-container">
                <Terminal />
            </div>
        </div>
    );
};

export default GamePage;
