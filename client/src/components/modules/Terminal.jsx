import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";

import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import './Terminal.css';

// Helper function to tokenize command
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

// Helper function to generate a random lobby code
function generateLobbyCode(existingCodes) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;
    do {
        code = Array.from({ length: 6 }, () =>
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
    } while (existingCodes.has(code));
    return code;
}

const Terminal = (props) => {
    const { history, addHistory, clearHistory } = useContext(TerminalContext);
    const [lobbyCodes, setLobbyCodes] = useState(new Set());
    const navigate = useNavigate();

    const executeCommand = (command) => {
        const tokens = tokenizeCommand(command);

        switch (tokens[0]) {
            case "cd":
                switch (tokens[1]) {
                    case "profile":
                        navigate("/profile");
                        return "navigating to the profile page";
                    case "home":
                        navigate("/");
                        return "navigating to the home page";
                    case "friends":
                        navigate("/friends");
                        return "navigating to the friends page";
                    case "settings":
                        navigate("/settings");
                        return "navigating to the settings page";
                    default:
                        return "Command does not exist";
                }
            case "create":
                if (tokens[1] === "lobby") {
                    const newLobbyCode = generateLobbyCode(lobbyCodes);
                    setLobbyCodes((prev) => new Set(prev).add(newLobbyCode));
                    navigate(`/lobby/${newLobbyCode}`);
                    return `Lobby created: ${newLobbyCode}. Navigating to the lobby.`;
                }
                return "Invalid create command. Did you mean 'create lobby'?";
            case "help":
                return "\nAvailable commands:\n\n" +
                    "  clear         - Clears the terminal screen\n" +
                    "  cd home       - Navigate to the home page\n" +
                    "  cd profile    - Navigate to your profile page\n" +
                    "  cd friends    - Navigate to the friends page\n" +
                    "  create lobby  - Create a new lobby and navigate to it\n" +
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
