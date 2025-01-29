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
      <MatrixRain />

      <div className="login-box">
        <h1 className="login-title">ACCESS PANEL</h1>

        <WordSwitcher
          words={[
            "HACKER",
            <span key="agent" className="blue-word">AGENT?</span>
          ]}
        />

        <LoginLogoutButton className="login-button" />
      </div>

      <div className="terminal-wrapper">
      </div>
    </div>
  );
};

export default LoginPage;
