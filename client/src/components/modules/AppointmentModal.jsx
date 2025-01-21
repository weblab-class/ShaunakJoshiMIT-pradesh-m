import React from "react";

const AppointmentModal = (props) => {

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{props.gameObj.turnOrder[props.gameObj.currTurn]}</h2>
                <p>Appoint a hacker!</p>
            </div>
        </div>
    );
}

export default AppointmentModal;
