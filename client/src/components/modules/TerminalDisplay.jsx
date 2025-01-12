import react from "react";


const TerminalDisplay = (props) => {
    const history = props.history
    const terminalHistory = history.map((entry, index) => {
        return(
        <div key = {index}>
            <div className = "command">{`<${props.username}> ` + entry.command}</div>
            <div className = "output">{entry.output.split("\n").map((line, i) => (<pre key = {i}> {line} </pre>))}</div>
        </div>
    )})

    return (
        <div className = "terminal-display">
            {terminalHistory}
        </div>
    );
}

export default TerminalDisplay;
