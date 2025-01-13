// src/components/pages/HomePage.jsx
import React, { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../contexts/UserContext";

const HomePage = () => {
  const userId = useContext(UserContext);

  const { handleLogin, handleLogout } = useOutletContext();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Welcome to Find the Moles!</h1>
      <p>Navigate the maze, solve trivia, and find the FBI imposter!</p>

      {userId ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <GoogleLogin
          text="signin_with"
          onSuccess={handleLogin}
          onError={(err) => console.error("Google Login Error", err)}
        />
      )}
    </div>
  );
};

export default HomePage;
