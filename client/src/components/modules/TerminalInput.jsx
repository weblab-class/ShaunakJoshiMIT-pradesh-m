import React, { useState } from "react";

const TerminalInput = (props) => {
    const [input, setInput] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if (input.trim()) {
            props.onCommand(input);
            setInput("");
        }
    }
    return (
        <form className = "terminal-input" onSubmit = {handleSubmit}>
            <span className="CurrentUser"> {`<${props.username}>`}</span>
                <input
                        type = "text"
                        value = {input}
                        onChange = {(e) => setInput(e.target.value)}
                />
        </form>
    )

}

export default TerminalInput;
