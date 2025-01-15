const express = require("express");
const Lobby = require("../models/lobby.js");
const router = express.Router();

router.post("/create", async (req, res) => {
    const { host_id } = req.body;
    try {
        const newLobbyCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const lobby = new Lobby({
            lobby_id: newLobbyCode,
            user_ids: [host_id],
            in_game: false,
            host_id,
        });
        await lobby.save();
        res.status(201).json({ lobby });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/leave", async (req, res) => {
    const { lobby_id, user_id } = req.body;
    try {
        const lobby = await Lobby.findOne({ lobby_id });
        if (!lobby) {
            return res.status(404).json({ message: "Lobby not found" });
        }
        lobby.user_ids = lobby.user_ids.filter((id) => id !== user_id);
        if (lobby.user_ids.length === 0) {
            await lobby.delete();
        } else {
            await lobby.save();
        }
        res.status(200).json({ message: "Left lobby successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;