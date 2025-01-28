// LoginPage.jsx
import React from "react";
import LoginLogoutButton from "../modules/LoginLogoutButton";
import WordSwitcher from "../modules/WordSwitcher";
import Terminal from "../modules/Terminal";
import MatrixRain from "../modules/MatrixRain";
import "../styles/LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-container">
      {/* MatrixRain background */}
      <MatrixRain />

      {/* Centered retro-styled login box */}
      <div className="login-box">
        <h1 className="login-title">ACCESS PANEL</h1>

        {/* Glitching WordSwitcher */}
        <WordSwitcher
          words={[
            "HACKER",
            <span key="agent" className="blue-word">AGENT?</span>
          ]}
        />

        {/* Login/Logout Button */}
        <LoginLogoutButton className="login-button" />
      </div>

      {/* Terminal area */}
      <div className="terminal-wrapper">
        {/* <Terminal /> */}
      </div>
    </div>
  );
};

export default LoginPage;
