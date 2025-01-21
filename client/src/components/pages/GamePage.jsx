// GamePage.jsx
import React from "react";
import Terminal from "../modules/terminal";
import MazeWrapper from "../modules/MazeWrapper";
import "./GamePage.css";




const GamePage = (props) => {
    const [imposters, setImposters] = useState([]);
    const [turnOrder, setTurnOrder] = useState([]);
    const [gameState, setGameState] = useState(null);
    const [currentChallenge, setCurrentChallenge] = useState(null);


    useEffect(() => {
        setImposters(props.lobby.imposters);
    }, []);

    useEffect(() => {
        setTurnOrder(props.lobby.turnOrder);
    })






    const hardCodedPlayers = ["Shaunak", "Pradesh", "Theo", "Twu"];







    return (
        <div className="game-page">
            {/* Maze Section: Flexible to occupy remaining space */}
            <div className="maze-container">
                <MazeWrapper rows={10} cols={10} />
            </div>

            {/* Terminal Section: Fixed height */}
            <div className="terminal-container">
                <Terminal />
            </div>
        </div>
    );
};

export default GamePage;
