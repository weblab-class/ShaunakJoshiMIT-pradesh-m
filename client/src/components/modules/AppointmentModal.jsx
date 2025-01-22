// AppointmentModal.jsx

import React from "react";
import "../styles/AppointmentModal.css";
import hackerIcon from "../../assets/onlinelogo.png";

const AppointmentModal = ({ gameObj }) => {
    const currentPresident = gameObj?.turnOrder[gameObj.currTurn] || "Unknown";

    return (
        <aside className="appointment-sidebar" aria-label="Appointment Sidebar">
            <div className="appointment-header">
                <img src={hackerIcon} alt="Hacker Icon" className="appointment-icon" />
                <h2>President: {currentPresident}</h2>
            </div>
            <div className="appointment-content">
                <p>It's your turn to appoint a hacker.</p>
                <p>Use the terminal to appoint a user:</p>
                <p><code>appoint &lt;nickname&gt;</code></p>
                <p>Awaiting appointment...</p>
            </div>
        </aside>
    );
};

export default AppointmentModal;
