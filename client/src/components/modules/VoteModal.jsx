// VoteModal.jsx

import React from "react";
import "../styles/VoteModal.css"; // Ensure you create this CSS file
import voteIcon from '../../assets/votingicon.png'; // Replace with your actual icon path

const VoteModal = ({ lobbyCode, hacker, onClose }) => {
    return (
        <div className="vote-overlay">
            <div className="vote-modal">
                <div className="vote-header">
                    <img src={voteIcon} alt="Vote Icon" className="vote-icon" />
                    <h2>Vote on Appointed Hacker</h2>
                </div>
                <div className="vote-content">
                    <p>Hacker: <strong>{hacker}</strong></p>
                    <p>Use the terminal to cast your vote:</p>
                    <p><code>vote approve</code> or <code>vote reject</code></p>
                </div>
                <button className="vote-close-button" onClick={onClose} aria-label="Close Vote Modal">Close</button>
            </div>
        </div>
    );
};

export default VoteModal;
