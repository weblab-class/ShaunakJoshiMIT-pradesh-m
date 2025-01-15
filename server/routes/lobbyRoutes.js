const express = require("express");
const Lobby = require("../models/lobby.js");
const router = express.Router();

// Helper function to generate a unique lobby code
function generateLobbyCode(existingCodes) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code;
    do {
        code = Array.from({ length: 5 }, () =>
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");
    } while (existingCodes.has(code));
    return code;
}

router.post("/create", async (req, res) => {
    const { host_id } = req.body;
    try {
        // Fetch all existing lobby codes to ensure uniqueness
        const existingLobbies = await Lobby.find({}, { lobbyCode: 1 });
        const existingCodes = new Set(existingLobbies.map((lobby) => lobby.lobbyCode));

        // Generate a new unique lobby code
        const newLobbyCode = generateLobbyCode(existingCodes);

        // Create a new lobby
        const lobby = new Lobby({
            lobbyCode: newLobbyCode, // Updated to match schema and use unique code generator
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
    const { lobbyCode, user_id } = req.body; // Updated to lobbyCode
    try {
        const lobby = await Lobby.findOne({ lobbyCode }); // Updated to lobbyCode
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
