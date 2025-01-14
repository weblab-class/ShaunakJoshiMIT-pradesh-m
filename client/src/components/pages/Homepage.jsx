import React from "react";
import "../../utilities.css";
import "../styles/HomePage.css"; 
import Layout from "../layout.jsx";
import LoginLogoutButton from "../modules/LoginLogoutButton.jsx";
import { UserContext } from "../App";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <Layout currentPage="home">
      <div className="homepage">
        <LoginLogoutButton />

        <div>
          <h1>Welcome to Find the Moles!</h1>
          <p>Navigate through the maze, solve trivia, and find the FBI imposter!</p>
          <h1>Home Page</h1>
          <Link to="/lobby/12345">Go to Lobby 12345</Link>
          <Link to="/lobby/67890">Go to Lobby 67890</Link>
        </div>

      </div>
    </Layout>
  );
};

export default HomePage;
