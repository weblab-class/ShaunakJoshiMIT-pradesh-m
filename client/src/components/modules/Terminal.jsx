import React, { useState } from "react";


/**
 * Terminal is a component for displaying the terminal
 * for user interaction
 * Proptypes
 * @param {string} content of the command

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


const Terminal = (props) => {
    const [inputs, setInputs] = useState([]);
    const [state, setState] = useState([]);

    const submitCommand = (command) => {
        // let tokens = tokenizeCommand(command);
        setInputs(inputs.concat([command, "this will be added"]))
    }
    


}
