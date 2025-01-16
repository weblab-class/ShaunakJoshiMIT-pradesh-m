import React from "react";
import "../../utilities.css";
import "../styles/HomePage.css";  // Ensure this file is in the same folder
import Layout from "../Layout.jsx";

const HomePage = () => {
  return (
    <Layout currentPage="home">
      <div className="homepage">
        <div className="homepage-content">
          <h1 className="title">WELCOME TO FIND THE MOLES!</h1>
          <p className="tagline">
            Navigate the labyrinth of cryptic clues to expose the FBI imposter!
          </p>
        </div>
        <div className="animation-bg"></div>
      </div>
    </Layout>
  );
};

export default HomePage;