import react, { useState, useContext, createContext } from "react";


const TerminalContext = createContext();

const TerminalProvider = ({children}) => {
    const[history, setHistory] = useState([]);

    const addHistory = (entry) => {
        setHistory([...history, entry]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <TerminalContext.Provider value = {{history, addHistory, clearHistory}}>
            {children}
        </TerminalContext.Provider>
    );

};

export { TerminalProvider, TerminalContext };


