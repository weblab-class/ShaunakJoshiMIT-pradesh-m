import React from "react";
import "../../utilities.css";
import "../styles/HomePage.css";
import Layout from "../layout.jsx";
import LoginLogoutButton from "../modules/LoginLogoutButton.jsx";
import { UserContext } from "../App";

const HomePage = () => {
  return (
    <Layout currentPage="home">
      <div className="homepage">
        <div>
          <h1>Welcome to Find the Moles!</h1>
          <p>Navigate through the maze, solve trivia, and find the FBI imposter!</p>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
