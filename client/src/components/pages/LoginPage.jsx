import React from "react";
import LoginLogoutButton from "../modules/LoginLogoutButton";
import WordSwitcher from "../modules/WordSwitcher";
import Terminal from "../modules/terminal";
import MatrixRain from "../modules/MatrixRain";
import "../styles/LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-container">
      <MatrixRain />
      
      <div className="login-box">
        <h1 className="login-title">Log in</h1>
        <WordSwitcher
          words={[
            "Hacker",
            <span key="agent" className="blue-word">Agent?</span>
          ]}
        />
        <LoginLogoutButton className="login-button" />
      </div>
      <div className="terminal-wrapper">
        <Terminal />
      </div>
    </div>
  );
};

export default LoginPage;
