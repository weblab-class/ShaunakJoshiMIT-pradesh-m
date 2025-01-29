// gameRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const fetch = require("node-fetch");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");
const { setPhaseTimeout, clearPhaseTimeout } = require("../utils/phaseTimeouts.js");


async function updateWinsLosses(game) {
  if (!game || game.phase !== "END" || !game.winner) return;

  const isHackersWin = game.winner === "HACKERS";

  for (const nickname of game.user_ids) {
    const userDoc = await User.findOne({ nickname });
    if (!userDoc) continue;
    const isFBI = game.imposters.includes(nickname);
    if (isHackersWin) {
      if (isFBI) {
        userDoc.losses = (userDoc.losses || 0) + 1;
      } else {
        userDoc.wins = (userDoc.wins || 0) + 1;
      }
    } else {
      if (isFBI) {
        userDoc.wins = (userDoc.wins || 0) + 1;
      } else {
        userDoc.losses = (userDoc.losses || 0) + 1;
      }
    }
    await userDoc.save();
  }
}

const PHASE_DURATIONS = {
  APPOINT: 25000,
  VOTE: 25000,
  MOVE: 25000,
  TRIVIA: 25000,
  RESULT: 10000,
};


async function fetchOpenTDBQuestion() {
  try {
    const resp = await fetch("https://opentdb.com/api.php?amount=1&encode=url3986");
    const data = await resp.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("No results from OpenTDB");
    }
    const result = data.results[0];

    // decode
    const questionStr = decodeURIComponent(result.question);
    const correct = decodeURIComponent(result.correct_answer);
    const incorrect = result.incorrect_answers.map(ans => decodeURIComponent(ans));

    // combine + shuffle
    const all = [...incorrect, correct];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    const correctIndex = all.indexOf(correct);

    return {
      question: questionStr,
      choices: all,
      correctChoice: correctIndex,
    };
  } catch (err) {
    console.error("OpenTDB fetch failed, using fallback question:", err);
    return {
      question: "Fallback: capital of France?",
      choices: ["Berlin","London","Paris","Rome"],
      correctChoice: 2,
    };
  }
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
    for (let neighbor of (adjacency[curr] || [])) {
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
    adjacencyMap[source]?.push(target);
    adjacencyMap[target]?.push(source);
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
    if (appointeeUser === user) {
      return res.status(403).json({ error: "Cannot appoint yourself" });
    }
    const isAppointeeInGame = game.user_ids.includes(appointeeUser.nickname);
    if (!isAppointeeInGame) {
      return res.status(400).json({ error: "Appointee is not in the game" });
    }
    game.appointedHacker = appointeeUser.nickname;
    game.phase = "VOTE";
    clearPhaseTimeout(lobbyCode);
    const phaseDuration = PHASE_DURATIONS.VOTE;
    game.phaseEndTime = Date.now() + phaseDuration;
    await game.save();
    const io = getIo();
    console.log("Emitting Game Data after APPOINT")
    io.to(lobbyCode).emit("gameData", game);
    setPhaseTimeout(lobbyCode, "VOTE", phaseDuration, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });
      if (!updatedGame || updatedGame.phase !== "VOTE") return;
      const votes = Object.values(updatedGame.votes || {});
      const approve = votes.filter((v) => v === "yes").length;
      const reject = votes.filter((v) => v === "no").length;
      if (approve >= reject && votes.length > 0) {
        updatedGame.hacker = updatedGame.appointedHacker;
        updatedGame.phase = "MOVE";
      } else {
        updatedGame.currTurn = (updatedGame.currTurn + 1) % updatedGame.user_ids.length;
        updatedGame.phase = "APPOINT";
      }
      updatedGame.appointedHacker = null;
      updatedGame.votes = {};
      const nextPhaseDuration =
        updatedGame.phase === "MOVE"
          ? PHASE_DURATIONS.MOVE
          : PHASE_DURATIONS.APPOINT;
      updatedGame.phaseEndTime = Date.now() + nextPhaseDuration;
      await updatedGame.save();
      io.to(lobbyCode).emit("gameData", updatedGame);
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, updatedGame.phase, nextPhaseDuration, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
    });
    return res.status(200).json({
      message: "Hacker appointed successfully",
      appointee: appointeeUser.nickname,
    });
  } catch (error) {
    console.error("Error in /appoint:", error);
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
      return res.status(400).json({ error: "No hacker appointed" });
    }
    if (!game.votes) game.votes = {};
    const user = await User.findById(user_id);

    if (game.votes[user.nickname]) {
      return res.status(400).json({ error: "You have already cast your vote" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    game.votes[user.nickname] = decision;
    await game.save();
    const io = getIo();
    if (Object.keys(game.votes).length === game.user_ids.length) {
      const votes = Object.values(game.votes);
      const approve = votes.filter((v) => v === "yes").length;
      const reject = votes.filter((v) => v === "no").length;
      if (approve >= reject) {
        game.hacker = game.appointedHacker;
        game.phase = "MOVE";
      } else {
        game.currTurn = (game.currTurn + 1) % game.user_ids.length;
        game.phase = "APPOINT";
      }
      game.appointedHacker = null;
      game.votes = {};
      clearPhaseTimeout(lobbyCode);
      const nextPhaseDuration =
        game.phase === "MOVE" ? PHASE_DURATIONS.MOVE : PHASE_DURATIONS.APPOINT;
      game.phaseEndTime = Date.now() + nextPhaseDuration;
      await game.save();
      console.log("Emitting Game Data after VOTE")
      io.to(lobbyCode).emit("gameData", game);
      setPhaseTimeout(lobbyCode, game.phase, nextPhaseDuration, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
      return res.status(200).json({ message: "Vote cast successfully, final result tallied" });
    } else {
      io.to(lobbyCode).emit("gameData", game);
      return res.status(200).json({ message: "Vote cast successfully" });
    }
  } catch (error) {
    console.error("Error in /vote:", error);
    return res.status(500).json({ error: "Failed to cast vote" });
  }
});
router.post("/move", async (req, res) => {
  const { user_id, lobbyCode, targetNode } = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) return res.status(404).json({ error: "Lobby not found" });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (game.phase !== "MOVE") {
      return res.status(403).json({ error: "Cannot move while in this phase" });
    }
    if (game.hacker !== user.nickname) {
      return res.status(403).json({ error: "Only the hacker can move" });
    }

    function isAdjacent(g, current, tgt) {
      return g.edges.some(({ source, target }) =>
        (source === current && target === tgt) ||
        (target === current && source === tgt)
      );
    }
    const currentNode = game.location || "0-0";
    if (!isAdjacent(game, currentNode, targetNode)) {
      return res
        .status(403)
        .json({ error: `Invalid move from ${currentNode} to ${targetNode}.` });
      }
    game.nextLocation = targetNode;
    game.phase = "TRIVIA";
    await game.save();

    const io = getIo();
    console.log("Emitting Game Data after MOVE")
    io.to(lobbyCode).emit("gameData", game);


    try {
      const realQ = await fetchOpenTDBQuestion();
      game.triviaQuestion = realQ;
    } catch (err) {
      game.triviaQuestion = {
        question: "Fallback question: capital of France?",
        choices: ["Berlin","London","Paris","Rome"],
        correctChoice: 2,
      };
    }

    clearPhaseTimeout(lobbyCode);
    const triviaPhaseDuration = PHASE_DURATIONS.TRIVIA;
    game.phaseEndTime = Date.now() + triviaPhaseDuration;
    await game.save();


    setPhaseTimeout(lobbyCode, "TRIVIA", triviaPhaseDuration, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });
      if (!updatedGame || updatedGame.phase !== "TRIVIA") return;

      updatedGame.phase = "RESULT";
      updatedGame.hackerAnswer = null;

      const resultPhaseDuration = PHASE_DURATIONS.RESULT;
      updatedGame.phaseEndTime = Date.now() + resultPhaseDuration;
      await updatedGame.save();
      io.to(lobbyCode).emit("gameData", updatedGame);

      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, "RESULT", resultPhaseDuration, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
    });

    return res.status(200).json({ message: "Move successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred during move" });
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
      return res.status(403).json({ error: "Cannot answer in this phase" });
    }
    clearPhaseTimeout(lobbyCode);
    game.phase = "RESULT";
    game.hackerAnswer = answer;
    const resultPhaseDuration = PHASE_DURATIONS.RESULT;
    game.phaseEndTime = Date.now() + resultPhaseDuration;
    await game.save();
    const io = getIo();
    console.log("Emitting Game Data after ANSWER")
    io.to(lobbyCode).emit("gameData", game);
    setPhaseTimeout(lobbyCode, "RESULT", resultPhaseDuration, async () => {
      await handleTimeoutForPhase(lobbyCode);
    });
    return res.status(200).json({ message: "Answer submitted" });
  } catch (error) {
    console.error("Error in /answer:", error);
    return res.status(500).json({ error: "An error occurred while answering" });
  }
});
router.post("/result", async (req, res) => {
  const { lobbyCode, user_id } = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    if (!game) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    if (game.phase !== "RESULT") {
      return res.status(403).json({ error: "Cannot process result in this phase" });
    }
    const user = await User.findById(user_id);
    if (!user || user.nickname !== game.hacker) {
      return res.status(403).json({ error: "Only the hacker can submit the result" });
    }
    const answerRight = Number(game.hackerAnswer) - 1 === game.triviaQuestion.correctChoice;
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
      let nodeIdToDelete = game.nextLocation;
      if (game.nextLocation === `${game.rows - 1}-${game.cols - 1}`) {
        nodeIdToDelete = null;
      }
      if (!game.nodes.some((n) => n.id === nodeIdToDelete)) {
        return res
          .status(400)
          .json({ error: `Node ${nodeIdToDelete} does not exist in the game.` });
      }
      game.nodes = game.nodes.filter((n) => n.id !== nodeIdToDelete);
      game.edges = game.edges.filter(
        (e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete
      );
      game.nextLocation = null;
      game.phase = "APPOINT";
    }
    game.currTurn = (game.currTurn + 1) % game.user_ids.length;
    if (!endReachable(game) && game.phase !== "END") {
      game.phase = "END";
      game.winner = "FBI";
    }
    clearPhaseTimeout(lobbyCode);
    if (game.phase === "END") {
      game.phaseEndTime = null;
      await game.save();
      await updateWinsLosses(game);
    } else {
      const appointPhaseDuration = PHASE_DURATIONS.APPOINT;
      game.phaseEndTime = Date.now() + appointPhaseDuration;
      await game.save();
    }
    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);
    if (game.phase === "APPOINT") {
      setPhaseTimeout(lobbyCode, "APPOINT", PHASE_DURATIONS.APPOINT, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
    }
    return res.status(200).json({ message: "Result submitted successfully" });
  } catch (error) {
    console.error("Error in /result:", error);
    return res.status(500).json({ error: "An internal server error occurred during result." });
  }
});
router.post("/rig", async (req, res) => {
  const {lobbyCode, user_id, target} = req.body;
  try {
    const game = await Game.findOne({ lobbyCode });
    const user = await Game.findById(user_id);
    if (!game) {
      return res.status(404).json({ error: "Game not found"})
    }
    if (!user || !game.imposters.includes(user.nickname)) {
      return res.status(400).json({error: "You are unable to do this"})
    }
    if (game.phase !== "VOTE") {
      return res.status(400).json({error: "You cannot rig in this phase"})
    }
  } catch (error) {
    console.error("Error in /rig:", error);
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

async function handleTimeoutForPhase(lobbyCode) {
  const io = getIo();
  const game = await Game.findOne({ lobbyCode });
  if (!game) return;
  switch (game.phase) {
    case "APPOINT": {
      game.currTurn = (game.currTurn + 1) % game.user_ids.length;
      game.phase = "APPOINT";
      game.phaseEndTime = Date.now() + PHASE_DURATIONS.APPOINT;
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, "APPOINT", PHASE_DURATIONS.APPOINT, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
      break;
    }
    case "VOTE": {
      const votes = Object.values(game.votes || {});
      const approve = votes.filter((v) => v === "yes").length;
      const reject = votes.filter((v) => v === "no").length;
      if (approve >= reject && votes.length > 0) {
        game.hacker = game.appointedHacker;
        game.phase = "MOVE";
      } else {
        game.currTurn = (game.currTurn + 1) % game.user_ids.length;
        game.phase = "APPOINT";
      }
      game.appointedHacker = null;
      game.votes = {};
      const nextPhaseDuration =
        game.phase === "MOVE" ? PHASE_DURATIONS.MOVE : PHASE_DURATIONS.APPOINT;
      game.phaseEndTime = Date.now() + nextPhaseDuration;
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, game.phase, nextPhaseDuration, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
      break;
    }
    case "MOVE": {
      const currentLocation = game.location || "0-0";
      const adjacentNodes = game.edges
        .filter((e) => e.source === currentLocation || e.target === currentLocation)
        .map((e) => (e.source === currentLocation ? e.target : e.source));
      if (adjacentNodes.length > 0) {
        game.nextLocation = adjacentNodes[Math.floor(Math.random() * adjacentNodes.length)];
      }
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      game.phase = "TRIVIA";
      game.triviaQuestion = generateTriviaQuestion();
      game.phaseEndTime = Date.now() + PHASE_DURATIONS.TRIVIA;
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, "TRIVIA", PHASE_DURATIONS.TRIVIA, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
      break;
    }
    case "TRIVIA": {
      game.phase = "RESULT";
      game.hackerAnswer = null;
      game.phaseEndTime = Date.now() + PHASE_DURATIONS.RESULT;
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, "RESULT", PHASE_DURATIONS.RESULT, async () => {
        await handleTimeoutForPhase(lobbyCode);
      });
      break;
    }
    case "RESULT": {
      const answerRight =
        game.hackerAnswer &&
        Number(game.hackerAnswer) - 1 === game.triviaQuestion.correctChoice;
      if (answerRight) {
        game.location = game.nextLocation;
        game.nextLocation = null;
        const [row, col] = (game.location || "0-0").split("-").map(Number);
        if (row === game.rows - 1 && col === game.cols - 1) {
          game.phase = "END";
          game.winner = "HACKERS";
        } else {
          game.phase = "APPOINT";
        }
      } else {
        const nodeIdToDelete = game.nextLocation;
        if (nodeIdToDelete) {
          game.nodes = game.nodes.filter((n) => n.id !== nodeIdToDelete);
          game.edges = game.edges.filter(
            (edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete
          );
        }
        game.nextLocation = null;
        game.phase = "APPOINT";
      }
      game.currTurn = (game.currTurn + 1) % game.user_ids.length;
      if (!endReachable(game) && game.phase !== "END") {
        game.phase = "END";
        game.winner = "FBI";
      }
      if (game.phase === "END") {
        game.phaseEndTime = null;
      } else {
        game.phaseEndTime = Date.now() + PHASE_DURATIONS.APPOINT;
      }
      await game.save();
      io.to(lobbyCode).emit("gameData", game);
      if (game.phase === "END") {
        await updateWinsLosses(game);
      }
      clearPhaseTimeout(lobbyCode);
      if (game.phase === "APPOINT") {
        setPhaseTimeout(lobbyCode, "APPOINT", PHASE_DURATIONS.APPOINT, async () => {
          await handleTimeoutForPhase(lobbyCode);
        });
      }
      break;
    }
    case "END":
    default:
      break;
  }
}



module.exports = router;
