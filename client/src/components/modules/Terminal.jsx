import React, { useState } from "react";
import NewTerminalResponse from "./NewTerminalResponse";
import NewTerminalInput from "./NewTerminalInput";


/**
 * Terminal is a component for displaying the terminal
 * for user interaction
 * Proptypes
 * @param {string} content of the command
 * @param {string} profileID
 */


const Terminal = (props) => {
    const [terminalText, setTerminalText] = useState([]);

    const updateTerminal = (command) => {
        setTerminalText(terminalText.concat([["props.profileID" + props.content, NewTerminalResponse(command)]]));
    }

    let terminalHistory = terminalText.map((arr) => {
        <div>{arr[0]}</div>
        arr[1]
    })

    return (
        <div>
        {terminalHistory}
        <NewTerminalInput onSubmit = {updateTerminal}/>
        </div>

    )

}

export default Terminal;
