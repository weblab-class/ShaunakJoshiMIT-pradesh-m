import React, { useContext } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { Link } from "react-router-dom";
import "../../utilities.css";
import { UserContext } from "../App";

const HomePage = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  return (
    <>
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
        <button>Create Game</button>
        <button>Join Game</button>
        <div>
        <Link to="/profile">Go to Profile</Link>
        </div>
      </div>
    </>
  );
};

export default HomePage;