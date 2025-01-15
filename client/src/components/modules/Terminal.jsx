import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";

import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import './Terminal.css';

import { UserContext } from "../App";

function tokenizeCommand(command) {
    const tokens = [];
    let currToken = "";
    for (let i = 0; i < command.length; i++) {
        if (command[i] !== " ") {
            currToken = currToken + command[i];
        } else {
            tokens.push(currToken);
            currToken = "";
        }
    }
    if (currToken.length > 0) {
        tokens.push(currToken);
    }
    return tokens;
}

function generateLobbyCode(existingCodes) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code;
    do {
        code = Array.from({ length: 5 }, () =>
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
    } while (existingCodes.has(code));
    return code;
}

const Terminal = (props) => {
    const { history, addHistory, clearHistory } = useContext(TerminalContext);
    const { userId, handleLogin, handleLogout} = useContext(UserContext);


    const [lobbyCodes, setLobbyCodes] = useState(new Set());
    const navigate = useNavigate();


    const executeCommand = (command) => {
        const tokens = tokenizeCommand(command);

        switch (tokens[0].toLowerCase()) {
            case "cd":
                switch (tokens[1]?.toLowerCase()) {
                    case "profile":
                        navigate("/profile");
                        return "navigating to the profile page";
                    case "home":
                        navigate("/home");
                        return "navigating to the home page";
                    case "friends":
                        navigate("/friends");
                        return "navigating to the friends page";
                    case "settings":
                        navigate("/settings");
                        return "navigating to the settings page";
                    case "login":
                        navigate("/");
                        return "navigating to the login page";
                    default:
                        return "Command does not exist";
                }
            case "create":
                if (tokens[1]?.toLowerCase() === "lobby") {
                    const newLobbyCode = generateLobbyCode(lobbyCodes);
                    setLobbyCodes((prev) => {
                        const updatedCodes = new Set(prev);
                        updatedCodes.add(newLobbyCode);
                        return updatedCodes;
                    });
                    navigate(`/lobby/${newLobbyCode}`);
                    return `Lobby created: ${newLobbyCode}. Navigating to the lobby.`;
                }
                return "Invalid create command. Did you mean 'create lobby'?";
            case "join":
                if (tokens[1]?.toLowerCase() === "lobby" && tokens.length === 3) {
                    const lobbyCode = tokens[2].toUpperCase();
                    if (lobbyCodes.has(lobbyCode)) {
                        navigate(`/lobby/${lobbyCode}`);
                        return `Joined lobby: ${lobbyCode}. Navigating to the lobby.`;
                    } else {
                        return `Lobby code ${lobbyCode} does not exist.`;
                    }
                }
                return "Invalid join command. Did you mean 'join lobby <lobbyCode>'?";

            case "logout":
                handleLogout()
                return "logging out"


            case "help":
                return "\nAvailable commands:\n\n" +
                    "  clear         - Clears the terminal screen\n" +
                    "  cd home       - Navigate to the home page\n" +
                    "  cd profile    - Navigate to your profile page\n" +
                    "  cd friends    - Navigate to the friends page\n" +
                    "  create lobby  - Create a new lobby and navigate to it\n" +
                    "  join lobby <lobbyCode> - Join an existing lobby by its code\n" +
                    "  help          - Display this list of commands\n";

            case "clear":
                clearHistory();
                return "";
            default:
                return "Command does not exist";
        }
    };

    const handleCommand = (command) => {
        const output = executeCommand(command);
        if (output.length !== 0) {
            addHistory({ command, output });
        }
    };

    return (
        <div className="terminal">
            <TerminalHeader />
            <TerminalDisplay username={props.username} history={history} />
            <TerminalInput username={props.username} onCommand={handleCommand} />
        </div>
    );
};

export default Terminal;
