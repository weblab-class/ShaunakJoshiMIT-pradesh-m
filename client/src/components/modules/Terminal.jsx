import react, { useState } from "react";
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
    const [history, setHistory] = useState([])

    const executeCommand = (command) => {
        const tokens = tokenizeCommand(command)

        switch (tokens[0]) {
            case "cd":
                switch (tokens[1]) {
                    case "profile":
                        return "navigating to the profile page";
                    case "home":
                        return "navigating to the home page";
                    case "friends":
                        return "What Friends?";
                    default:
                        return "Command does not exist";
                }
            case "help":
                return "here is a list of commands: help, cd home, cd profile, cd friends, clear";
            case "clear":
                setHistory([]);
                return "";
            default:
                return "Command does not exist";
        }
    }
    const handleCommand = (command) => {
        const output = executeCommand(command);
        if (output.length != 0) {
        setHistory([...history, { command, output}]);
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
