// GamePage.jsx
import React, { useState, useEffect } from "react";
import Terminal from "../modules/Terminal";
import MazeWrapper from "../modules/MazeWrapper";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/GamePage.css";
import AppointmentModal from "../modules/AppointmentModal";
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

const GamePage = (props) => {
    const { lobbyCode} = useParams();
    const navigate = useNavigate();
    const [gameObj, setGameObj] = useState({});

    console.log(lobbyCode)
    useEffect(() => {
        if (!lobbyCode) {
            navigate("/home");
            return;
        }

        socket.emit("getGameData", lobbyCode);
        socket.on("gameData", (data) => {
            setGameObj(data);
        });
        return () => {
            socket.off("gameData");
        };

    }, [lobbyCode]);

    console.log(gameObj);

    return (
        <div>
            Hello World! {lobbyCode}
        </div>
    )
    // return (
    //     <div className="game-page">
    //         {/* Maze Section: Flexible to occupy remaining space */}
    //         <AppointmentModal gameObj = {gameObj} />
    //         <div className="maze-container">
    //             <MazeWrapper game = {gameObj} />
    //         </div>

    //         {/* Terminal Section: Fixed height */}
    //         <div className="terminal-container">
    //             <Terminal />
    //         </div>
    //     </div>
    // );
};


export default GamePage;
