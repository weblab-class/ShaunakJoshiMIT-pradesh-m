import React from "react";

import LoginLogoutButton from "../modules/LoginLogoutButton";
import WordSwitcher from "../modules/WordSwitcher";
import Terminal from "../modules/terminal";

import "./LoginPage.css";

const LoginPage = () => {

    return (
        <div className="Login-Container">
            <span>Log in</span>
            <WordSwitcher words = {["Hacker", "Agent?"]}/>
            <LoginLogoutButton className = "login-button"/>
            <Terminal />
        </div>
    )


}

export default LoginPage;
