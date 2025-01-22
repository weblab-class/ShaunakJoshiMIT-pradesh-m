import React from "react";
import "../styles/AppointmentModal.css";
const VoteModal = ({ gameObj, appointee }) => {
    if (!gameObj) return null; // Optional: Handle cases where gameObj is undefined

    let users = gameObj.user_ids.map((name) => {
        return (
            <tr>
                <td>{name}</td>
            </tr>
        )
    });
    return (
        <div className="appointment-sidebar">
            <div className="appointment-header">
                <h2>{appointee}</h2>
            </div>
            <div className="appointment-content">
                <p>Vote for this hacker!</p>
            <table className = "player-table">
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {users}
                </tbody>
            </table>

                {/* Add any additional content or actions here */}
                {/* Example: Appoint Button */}
            </div>
        </div>
    );
};

export default VoteModal;
