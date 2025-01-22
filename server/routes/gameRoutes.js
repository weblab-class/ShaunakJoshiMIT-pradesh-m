const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");

router.post("/appoint", async (req, res) => {
    const { user_id, lobbyCode, apointee } = req.body;

    try {
        const game = await Game.findOne({ lobbyCode });
        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }

        const user = await User.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.nickname !== game.turnOrder[game.currTurn]) {
            return res.status(403).json({ error: "Not your turn" });
        }

        // if (!game.user_ids.includes(apointee)) {
        //     return res.status(400).json({ error: "Invalid apointee" });
        // }

        const socket = getSocketFromUserID(user_id);
        if (!socket) {
            console.error(`Socket not found for user_id: ${user_id}`);
            return res.status(404).json({ error: "User not found in any game" });
        }

        socket.emit("appointed", apointee);
        res.status(200).json({ message: "User successfully appointed" });
    } catch (error) {
        console.error("Error in appoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
