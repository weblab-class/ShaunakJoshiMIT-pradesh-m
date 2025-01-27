const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");
const { setPhaseTimeout, clearPhaseTimeout } = require("../utils/phaseTimeouts.js");

function generateTriviaQuestion() {
  return {
    question: "What is the capital of France?",
    choices: ["Berlin", "London", "Paris", "Rome"],
    correctChoice: 2,
  };
}

function endReachable(game) {
  const start = game.location;
  const goal = `${game.rows - 1}-${game.cols - 1}`;
  if (start === goal) return true;

  const adjacency = buildAdjacencyMap(game.nodes, game.edges);
  const visited = new Set();
  const queue = [start];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === goal) return true;

    const neighbors = adjacency[curr] || [];
    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

function buildAdjacencyMap(nodes, edges) {
  const adjacencyMap = {};

  for (let node of nodes) {
    adjacencyMap[node.id] = [];
  }

  for (let edge of edges) {
    const { source, target } = edge;
    if (adjacencyMap[source]) adjacencyMap[source].push(target);
    if (adjacencyMap[target]) adjacencyMap[target].push(source);
  }

  return adjacencyMap;
}

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

    game.appointedHacker = appointeeUser.nickname;
    game.phase = "VOTE";
    await game.save();

    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);

    clearPhaseTimeout(lobbyCode);

    const phaseDuration = 15000;
    setPhaseTimeout(lobbyCode, "VOTE", phaseDuration, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });

      if (updatedGame && updatedGame.phase === "VOTE") {
        const votes = Object.values(updatedGame.votes || {});
        const approve = votes.filter((v) => v === "yes").length;
        const reject = votes.filter((v) => v === "no").length;

        if (approve >= reject) {
          updatedGame.hacker = updatedGame.appointedHacker;
          updatedGame.phase = "MOVE";
        } else {
          updatedGame.currTurn = (updatedGame.currTurn + 1) % updatedGame.user_ids.length;
          updatedGame.phase = "APPOINT";
        }

        updatedGame.appointedHacker = null;
        updatedGame.votes = {};
        await updatedGame.save();

        io.to(lobbyCode).emit("gameData", updatedGame);
      }
    });

    return res.status(200).json({
      message: "Hacker appointed successfully",
      appointee: appointeeUser.nickname,
    });
  } catch (error) {
    console.error("Error in appoint:", error);
    return res.status(500).json({ error: "Failed to appoint hacker" });
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
    game.votes[userNickname] = decision;
    await game.save();

    const io = getIo();

    if (Object.keys(game.votes).length === game.user_ids.length) {
      const votes = Object.values(game.votes);
      const approve = votes.filter((vote) => vote === "yes").length;
      const reject = votes.filter((vote) => vote === "no").length;

      if (approve >= reject) {
        game.hacker = game.appointedHacker;
        game.phase = "MOVE";
      } else {
        game.currTurn = (game.currTurn + 1) % game.user_ids.length;
        game.phase = "APPOINT";
      }

      game.appointedHacker = null;
      game.votes = {};
      await game.save();

      clearPhaseTimeout(lobbyCode);
      io.to(lobbyCode).emit("gameData", game);

      return res.status(200).json({
        message: "Vote cast successfully, final result tallied",
      });
    } else {
      io.to(lobbyCode).emit("gameData", game);
      return res.status(200).json({ message: "Vote cast successfully" });
    }
  } catch (error) {
    console.error("Error in vote:", error);
    return res.status(500).json({ error: "Failed to cast" });
  }
});

router.post("/move", async (req, res) => {
  const { user_id, lobbyCode, targetNode } = req.body;

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

    function isAdjacentViaEdges(g, currentNode, tgtNode) {
      return g.edges.some((edge) => {
        const { source, target } = edge;
        return (
          (source === currentNode && target === tgtNode) ||
          (target === currentNode && source === tgtNode)
        );
      });
    }

    const currentNode = game.location || "0-0";
    const validMove = isAdjacentViaEdges(game, currentNode, targetNode);

    if (!validMove) {
      return res.status(403).json({
        error: `Invalid move from ${currentNode} to ${targetNode}.`,
      });
    }

    game.nextLocation = targetNode;
    game.phase = "TRIVIA";
    game.triviaQuestion = generateTriviaQuestion();
    await game.save();

    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);

    clearPhaseTimeout(lobbyCode);

    const triviaPhaseDuration = 15000;
    setPhaseTimeout(lobbyCode, "TRIVIA", triviaPhaseDuration, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });

      if (updatedGame && updatedGame.phase === "TRIVIA") {
        updatedGame.phase = "RESULT";
        updatedGame.hackerAnswer = null;
        await updatedGame.save();

        io.to(lobbyCode).emit("gameData", updatedGame);
      }
    });

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

    const io = getIo();

    game.phase = "RESULT";
    game.hackerAnswer = answer;
    io.to(lobbyCode).emit("gameData", game);
    await game.save();

    clearPhaseTimeout(lobbyCode);

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

    if (!user || user.nickname !== game.hacker) {
      return res.status(403).json({ error: "Only the hacker can submit the result" });
    }

    const answerRight = (Number(game.hackerAnswer) - 1) === game.triviaQuestion.correctChoice;

    if (answerRight) {
      game.location = game.nextLocation;
      game.nextLocation = null;

      const [row, col] = game.location.split("-").map(Number);
      if (row === game.rows - 1 && col === game.cols - 1) {
        game.phase = "END";
        game.winner = "HACKERS";
      } else {
        game.phase = "APPOINT";
      }
    } else {
      const nodeIdToDelete = game.nextLocation;
      const nodeExists = game.nodes.some((node) => node.id === nodeIdToDelete);

      if (!nodeExists) {
        return res.status(400).json({
          error: `Node ${nodeIdToDelete} does not exist in the game.`,
        });
      }

      game.nodes = game.nodes.filter((node) => node.id !== nodeIdToDelete);
      game.edges = game.edges.filter(
        (edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete
      );
      game.nextLocation = null;
      game.phase = "APPOINT";
    }

    game.currTurn = (game.currTurn + 1) % game.user_ids.length;
    game.phase = game.phase === "END" ? "END" : "APPOINT";

    if (!endReachable(game) && game.phase !== "END") {
      game.phase = "END";
      game.winner = "FBI";
    }

    await game.save();

    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);

    clearPhaseTimeout(lobbyCode);

    if (game.phase === "APPOINT") {
      setPhaseTimeout(lobbyCode, "APPOINT", 10000, async () => {
        const updatedGame = await Game.findOne({ lobbyCode });

        if (updatedGame && updatedGame.phase === "APPOINT") {
          updatedGame.currTurn = (updatedGame.currTurn + 1) % game.user_ids.length;
          await updatedGame.save();
          io.to(lobbyCode).emit("gameData", updatedGame);
        }
      });
    }

    return res.status(200).json({ message: "Result submitted successfully" });
  } catch (error) {
    console.error("Error in /result:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
});

router.get("/role", async (req, res) => {
  const { lobbyCode, user_id } = req.query;

  try {
    const game = await Game.findOne({ lobbyCode });
    const user = await User.findById(user_id);

    if (!game || !user) {
      return res.status(404).json({ error: "Lobby or user not found" });
    }

    if (game.imposters.includes(user.nickname)) {
      return res.status(200).json({ role: "FBI" });
    } else {
      return res.status(200).json({ role: "HACKER" });
    }
  } catch (error) {
    console.error("Error in /role:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
});

module.exports = router;
