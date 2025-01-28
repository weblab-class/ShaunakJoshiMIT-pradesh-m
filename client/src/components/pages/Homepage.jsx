// HomePage.jsx
import React from "react";
import "../../utilities.css";
import "../styles/HomePage.css"; // Ensure this file is in the same folder
import Layout from "../Layout.jsx";

const HomePage = () => {
  return (
    <Layout currentPage="home">
      <div className="homepage">
        {/* Main content container */}
        <div className="homepage-content">
          <h1 className="title">WELCOME TO FIND THE MOLES!</h1>
          <p className="tagline">
            Navigate the labyrinth of cryptic clues to expose the FBI imposter!
          </p>
        </div>

        {/* New Game Info / Retro Section */}
        <div className="game-info">
          <pre className="ascii-mole">
{String.raw`   __
  (oO)
  (\/)
   ^^  `}
          </pre>
          <div className="game-desc">
            <h2 className="game-desc-title">MISSION STATUS:</h2>
            <p className="blinking-text">INFILTRATION IN PROGRESS...</p>
            <p className="game-desc-body">
              The FBI is among us, working against our every move. Will you uncover their identities before
              we hit our mark? Or will they thwart our plans and send us to jail?
            </p>
          </div>
        </div>

        {/* Existing background animation */}
        <div className="animation-bg"></div>
      </div>
    </Layout>
  );
};

export default HomePage;
