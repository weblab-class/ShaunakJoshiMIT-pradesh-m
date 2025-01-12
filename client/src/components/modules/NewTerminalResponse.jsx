import React, { useState } from "react";


/**
 * NewTerminalResponse is component for returning
 * response to a terminal command
 *
 * Proptypes
 * @param {string} command is the placeholder text
 */
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

const NewTerminalResponse = (props) => {
    const tokens = tokenizeCommand(props.command);
    if (tokens[0] === "cd") {
        if (tokens[1] === "profile") {
            return <div>Going to Profile Page</div>

        } else if (tokens[1] === "home") {
            return <div>Going to Home Page</div>
        } else {
            return <div>Command Nonexistent</div>
        }
    } else {
        return <div>Command Nonexistent</div>
    }


}


export default NewTerminalResponse;
