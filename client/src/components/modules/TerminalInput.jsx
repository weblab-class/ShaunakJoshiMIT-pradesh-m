import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";


const TerminalInput = (props) => {

    const inputRef = useRef(null);
    const location = useLocation()
    const [input, setInput] = useState("");

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        };
    }, [location.pathname])

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
                        ref = {inputRef}
                        type = "text"
                        value = {input}
                        onChange = {(e) => setInput(e.target.value)}
                />
        </form>
    )

}

export default TerminalInput;
