import React, { useContext, useState } from "react";
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { TerminalContext } from "./TerminalContext";


import TerminalHeader from "./TerminalHeader";
import TerminalDisplay from "./TerminalDisplay";
import TerminalInput from "./TerminalInput";
import './Terminal.css';

function tokenizeCommand(command) {
    const tokens = [];
    let currToken = "";
    for (let i = 0; i < command.length ; i++) {
        if (command[i] != " ") {
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


const Terminal = (props) => {
    const { history, addHistory, clearHistory} = useContext(TerminalContext);


    const navigate = useNavigate()
    const executeCommand = (command) => {
        const tokens = tokenizeCommand(command)

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
                        navigate("/friends")
                        return "navigating to the friends page?";
                    default:
                        return "Command does not exist";
                }
            case "help":
                return "\nAvailable commands:\n\n" +
                    "  clear         - Clears the terminal screen\n" +
                    "  cd home       - Navigate to the home page\n" +
                    "  cd profile    - Navigate to your profile page\n" +
                    "  cd friends    - Navigate to the friends page\n" +
                    "  help          - Display this list of commands\n";

            case "clear":
                // setHistory([]);
                clearHistory()
                return "";
            default:
                return "Command does not exist";
        }
    }
    const handleCommand = (command) => {
        const output = executeCommand(command);
        if (output.length != 0) {
        // setHistory([...history, { command, output}]);
        addHistory({ command, output })
        }
    }

    return (
        <div className = "terminal">
            <TerminalHeader />
            <TerminalDisplay username = {props.username} history = {history} />
            <TerminalInput username = {props.username} onCommand = {handleCommand} />
        </div>
    )
}

export default Terminal;
