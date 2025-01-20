import react from "react";
import Terminal from "../modules/terminal";
import Maze from "../modules/Maze";
const GamePage = () => {
    return (
        <div>
        <Maze rows = {10} cols = {10} categories = {1} />
        <Terminal />
        </div>
    )
}

export default GamePage;
