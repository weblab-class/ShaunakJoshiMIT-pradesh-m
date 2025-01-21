import react from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const ElectModal = (props) => {
    const [showModal, setShowModal] = useState(false);
    const [turnOrder, setTurnOrder] = useState("");

    useEffect(() => {
        socket.on("startAppointment", (data) => {
            setTurnOrder(data.next);
            setShowModal(true);
        });

        socket.on("appointResult", (result) => {
            setShowModal(false);
            console.log(result);
        });



        const handleVote = (vote) => {
            socket.emit("vote", { vote, player: turnOrder});
        };
    }, []);

    if (showModal) {
        return (
            <div className="elect-modal">
                <h2>Appoint a hacker: {turnOrder}</h2>
                <h2>Type: appoint nickname</h2>

            </div>
        );
    }

    return null;
};
export default ElectModal;
