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
        game.hacker = game.appointedHacker;
        game.phase = "MOVE";
      } else {
        io.to(lobbyCode).emit("nextTurn", lobbyCode);
        game.phase = "APPOINT";
      }

      // Reset for next round (or next appointment)
      game.appointedHacker = null;
      game.votes = {};

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




router.post("/move", async (req, res) => {
  const { user_id, lobbyCode, targetNode} = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userNickname = user.nickname;

    if (game.phase !== "MOVE") {
      return res.status(403).json({ error: "Cannot move while in this phase" });
    }

    if (game.hacker !== userNickname) {
      return res.status(403).json({ error: "Only the hacker can move" });
    }

    function isAdjacentViaEdges(game, currentNode, targetNode) {
        return game.edges.some((edge) => {
          const {source, target} = edge;
          return (source === currentNode && target === targetNode) || (target === currentNode && source === targetNode);
        });
    }

    const currentNode = game.location || "0-0";

    const validMove = isAdjacentViaEdges(game, currentNode, targetNode);
    if (!validMove) {
      return res.status(403).json({ error: `Invalid move from ${currentNode} to ${targetNode}.` });
    }
    game.nextLocation = targetNode;
    game.phase = "TRIVIA";

    const triviaQuestion = generateTriviaQuestion();
    game.triviaQuestion = triviaQuestion;

    await game.save();

    // Broadcast updated game (all done)
    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);
    // io.to(lobbyCode).emit("nextTurn", lobbyCode);

    return res.status(200).json({ message: "Move successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/answer", async (req, res) => {
  const { user_id, lobbyCode, answer } = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.nickname !== game.hacker) {
      return res.status(403).json({ error: "Only the hacker can answer" });
    }

    if (game.phase !== "TRIVIA") {
      return res.status(403).json({ error: "Cannot answer while in this phase" });
    }

    const { question, choices, correctChoice } = game.triviaQuestion;
    const io = getIo();
    // if (answerRight) {
    //     game.phase = "RESULT";
    //     game.hackerAnswer = answer;
    // } else {
    //     game.phase = "RESULT";
    //     game.hackerAnswer = answer;
    // }
    // io.to(lobbyCode).emit("nextTurn", lobbyCode);

    game.phase = "RESULT";
    game.hackerAnswer = answer;
    io.to(lobbyCode).emit("gameData", game);
    await game.save();
    return res.status(200).json({ message: "Answer submitted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/result", async (req, res) => {
    const { lobbyCode, user_id } = req.body;
    try {
      const game = await Game.findOne({ lobbyCode });
      const user = await User.findById(user_id);

      if (!game) {
        return res.status(404).json({ error: "Lobby not found" });
      }
      if (game.phase !== "RESULT") {
        return res.status(403).json({ error: "Cannot process result while in this phase" });
      }
      if (user.nickname !== game.hacker) {
        return res.status(403).json({ error: "Only the hacker can submit the result" });
      }

      const answerRight = (game.hackerAnswer - 1) === game.triviaQuestion.correctChoice;

      if (answerRight) {
        game.location = game.nextLocation;
        game.nextLocation = null;
        game.phase = "APPOINT";
      } else {
        const nodeIdToDelete = game.nextLocation;

        const nodeExists = game.nodes.some((node) => node.id === nodeIdToDelete);
        if (!nodeExists) {
          return res.status(400).json({ error: `Node ${nodeIdToDelete} does not exist in the game.` });
        }

        game.nodes = game.nodes.filter((node) => node.id !== nodeIdToDelete);
        game.edges = game.edges.filter(
          (edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete
        );


        game.phase = "APPOINT";

        game.nextLocation = null;
      }

      await game.save();

      const io = getIo();
      io.to(lobbyCode).emit("gameData", game);

      io.to(lobbyCode).emit("nextTurn", lobbyCode);

      return res.status(200).json({ message: "Result submitted successfully" });
    } catch (error) {
      console.error("Error in /result:", error);
      return res.status(500).json({ error: "An internal server error occurred." });
    }
  });

function generateTriviaQuestion() {
    return {
      question: "What is the capital of France?",
      choices: ["Berlin", "London", "Paris", "Rome"],
      correctChoice: 2,
    };
  }

module.exports = router;
