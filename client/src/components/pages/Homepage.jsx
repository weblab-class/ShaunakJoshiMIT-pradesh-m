import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import "../../utilities.css";
import { UserContext } from "../App.jsx";
import "../styles/HomePage.css"; 
import Layout from '../layout.jsx';
import Terminal from "../modules/terminal.jsx";


const HomePage = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
  <Layout currentPage = "home">
  <div className="homepage">
  {userId ? (
        <button
          onClick={() => {
            googleLogout();
            handleLogout();
          }}
        >
          Logout
        </button>
      ) : (
        <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
      )}

      <div>
        <h1>Welcome to the Maze Game!</h1>
        <p>Navigate through the maze, solve trivia, and find the FBI imposter!</p>
      </div>


      <Terminal username = "shaunakj"/>

    </div>
    </Layout>
  );
};

export default HomePage;
