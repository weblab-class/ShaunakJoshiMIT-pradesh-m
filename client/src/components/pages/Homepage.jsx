import React from "react";
import "../../utilities.css";
import "../styles/HomePage.css";
import Layout from "../Layout.jsx";
import CommandHints from "../modules/CommandHints.jsx";

const HomePage = () => {
  const commands = [
    "create lobby",
    "cd profile",
    "cd friends",
    "cd settings"
  ];

  return (
    <Layout currentPage="home">
      <div className="homepage">
        <div className="homepage-content">
          <h1 className="title">WELCOME TO FIND THE MOLES!</h1>
          <p className="tagline">
            Navigate the labyrinth of cryptic clues to expose the FBI imposter!
          </p>
        </div>

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

        <div className="animation-bg"></div>
      </div>
      <CommandHints commands={commands} />
    </Layout>
  );
};

export default HomePage;
