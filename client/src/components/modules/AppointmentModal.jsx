import React from "react";

const AppointmentModal = ({ gameObj }) => {
    if (!gameObj) return null; // Optional: Handle cases where gameObj is undefined

    return (
        <div className="appointment-sidebar">
            <div className="appointment-header">
                <h2>{gameObj.turnOrder[gameObj.currTurn]}</h2>
            </div>
            <div className="appointment-content">
                <p>Appoint a hacker!</p>
                {/* Add any additional content or actions here */}
                {/* Example: Appoint Button */}
            </div>
        </div>
    );
};

export default AppointmentModal;
