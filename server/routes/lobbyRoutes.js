const express = require("express");
const Lobby = require("../models/lobby.js");
const router = express.Router();
const socketManager = require("../server-socket");

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
    const existingLobbies = await Lobby.find({}, { lobbyCode: 1 });
    const existingCodes = new Set(existingLobbies.map((lobby) => lobby.lobbyCode));

    const newLobbyCode = generateLobbyCode(existingCodes);

    const lobby = new Lobby({
      lobbyCode: newLobbyCode,
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

router.post("/join", async (req, res) => {
  const { lobbyCode, user_id } = req.body;

  try {
    const lobby = await Lobby.findOne({ lobbyCode });

    if (!lobby) {
      return res.status(404).json({ message: "Lobby not found" });
    }

    if (!lobby.user_ids.includes(user_id)) {
      lobby.user_ids.push(user_id);
      await lobby.save();
    }
    socketManager.getIo().to(lobbyCode).emit("updateUsers", { action: "join", user: user_id });

    res.status(200).json({ lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/leave", async (req, res) => {
  const { lobbyCode, user_id } = req.body;

  try {
    const lobby = await Lobby.findOne({ lobbyCode });

    if (!lobby) {
      return res.status(404).json({ message: "Lobby not found" });
    }

    lobby.user_ids = lobby.user_ids.filter((id) => id !== user_id);

    if (lobby.user_ids.length === 0) {
      await Lobby.deleteOne({ lobbyCode });
      socketManager.getIo().to(lobbyCode).emit("updateUsers", { action: "empty", user: user_id });
      return res.status(200).json({ message: "Lobby deleted as it became empty." });
    }

    await lobby.save();
    socketManager.getIo().to(lobbyCode).emit("updateUsers", { action: "leave", user: user_id });

    res.status(200).json({ message: "Left lobby successfully", lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
