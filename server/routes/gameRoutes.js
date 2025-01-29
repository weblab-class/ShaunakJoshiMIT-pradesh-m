// gameRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const fetch = require("node-fetch"); // <-- ensure 'node-fetch' is installed
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");
const { setPhaseTimeout, clearPhaseTimeout } = require("../utils/phaseTimeouts.js");

/**
 * Update user wins/losses after a finished game
 */
async function updateWinsLosses(game) {
  // Only update if game ended with a known winner
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

// --- We keep your existing PHASE_DURATIONS
const PHASE_DURATIONS = {
  APPOINT: 25000,
  VOTE: 25000,
  MOVE: 25000,
  TRIVIA: 25000,
  RESULT: 10000,
};

/**
 * Fetch a random question from OpenTDB, parse it into { question, choices[], correctChoice } format.
 */
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

    // find index of correct in the shuffled array
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

// existing helper: check if bottom-right node reachable
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

/* ------------------------------------------------------------------
   ROUTES
------------------------------------------------------------------*/

// ... APPOINT, VOTE, etc. remain the same

// --- Hacker chooses a node to move to
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

    // adjacency check
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

    // Switch to TRIVIA phase
    game.nextLocation = targetNode;
    game.phase = "TRIVIA";

    // -------- NEW: fetch from OpenTDB instead of dummy question
    try {
      const realQ = await fetchOpenTDBQuestion();
      game.triviaQuestion = realQ;
    } catch (err) {
      // fallback if something fails
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

    const io = getIo();
    io.to(lobbyCode).emit("gameData", game);

    // schedule forced transition to RESULT after TRIVIA time
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

// ... the rest of your routes remain the same (answer, result, role, etc.)

// TIMEOUT HANDLER remains the same

module.exports = router;
