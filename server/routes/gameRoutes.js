// routes/GameRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");

router.post("/appoint", async (req, res) => {
  const { user_id, lobbyCode, appointee } = req.body;

  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only the "current president" can appoint:
    const currentPresidentNickname = game.turnOrder[game.currTurn];
    if (user.nickname !== currentPresidentNickname) {
      return res.status(403).json({ error: "Only the current president can appoint" });
    }

    if (game.phase !== "APPOINT") {
      return res.status(403).json({ error: "Cannot appoint while in this phase" });
    }

    const appointeeUser = await User.findOne({ nickname: appointee });
    if (!appointeeUser) {
      return res.status(404).json({ error: "Appointee user not found" });
    }

    const isAppointeeInGame = game.user_ids.includes(appointeeUser.nickname);
    if (!isAppointeeInGame) {
      return res.status(400).json({ error: "Appointee is not in the game" });
    }

    // 1) Set appointedHacker & phase = VOTE
    game.appointedHacker = appointeeUser.nickname;
    game.phase = "VOTE";
    await game.save();

    // 2) Broadcast entire updated game
    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);

    res.status(200).json({
      message: "Hacker appointed successfully",
      appointee: appointeeUser.nickname,
    });
  } catch (error) {
    console.error("Error in appoint:", error);
    res.status(500).json({ error: "Failed to appoint hacker" });
  }
});

router.post("/vote", async (req, res) => {
  const { user_id, lobbyCode, decision } = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (!game.appointedHacker) {
      return res.status(400).json({ error: "No hacker has been appointed" });
    }

    // Initialize votes object if needed
    if (!game.votes) {
      game.votes = {};
    }
    if (game.votes[user_id]) {
      return res.status(400).json({ error: "You have already cast your vote" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userNickname = user.nickname;

    // Record this user's vote
    game.votes[userNickname] = decision;
    await game.save();

    const io = getIo();

    // If all players have voted, tally
    if (Object.keys(game.votes).length === game.user_ids.length) {
      const votes = Object.values(game.votes);
      const approve = votes.filter((vote) => vote === "yes").length;
      const reject = votes.filter((vote) => vote === "no").length;

      if (approve >= reject) {
        // Approved
        game.hacker = game.appointedHacker; // Officially becomes the hacker
      } else {
        io.to(lobbyCode).emit("nextTurn", lobbyCode);
      }

      // Reset for next round (or next appointment)
      game.appointedHacker = null;
      game.votes = {};

      // Return to "APPOINT" phase, or whatever your next phase is
      game.phase = "APPOINT";

      await game.save();

      // Broadcast updated game (all done)
      io.to(lobbyCode).emit("gameData", game);

      return res.status(200).json({
        message: "Vote cast successfully, final result tallied",
      });
    } else {
      // Not everyone has voted yet; optionally broadcast partial game
      io.to(lobbyCode).emit("gameData", game);
      return res.status(200).json({
        message: "Vote cast successfully",
      });
    }
  } catch (error) {
    console.error("Error in vote:", error);
    return res.status(500).json({ error: "Failed to cast" });
  }
});

module.exports = router;
