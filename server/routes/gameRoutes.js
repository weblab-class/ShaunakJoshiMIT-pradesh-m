const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
// const io = require("../server-socket").getIo();
const { getSocketFromUserID, getIo } = require("../server-socket");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");

router.get("/:lobbyCode", async (req, res) => {
    const { lobbyCode } = req.params;
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    return res.json(game);
});


module.exports = router;
