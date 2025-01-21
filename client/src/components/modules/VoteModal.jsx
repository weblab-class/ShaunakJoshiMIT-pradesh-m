import react from "react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");


const VoteModal = (props) => {
    const [showModal, setShowModal] = useState(false);
    const [appointedHacker, setAppointedHacker] = useState("");

    useEffect(() => {
        socket.on("startElection", (data) => {
            setAppointedHacker(data.next);
            setShowModal(true);
        });

    }, []);

}

export default VoteModal;
