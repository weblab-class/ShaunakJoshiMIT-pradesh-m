// lobbyRoutes.js

const express = require("express");
const Lobby = require("../models/lobby.js");
const router = express.Router();
const socketManager = require("../server-socket");
const Game = require("../models/game.js");
const User = require("../models/user.js");

/** -------------- IMPORT PHASE TIMEOUTS -------------- **/
const { setPhaseTimeout, clearPhaseTimeout } = require("../utils/phaseTimeouts.js");

/** -------------- DURATIONS -------------- **/
const APPOINT_DURATION = 25000; // 25 seconds for the initial APPOINT phase

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

function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomElements(array, n) {
  if (n > array.length) {
    throw new Error("n cannot be larger than the array size");
  }
  const shuffled = array.slice();
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * (shuffled.length - i)) + i;
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

function generateGridNodes(rows, cols) {
  const nodes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}-${col}`;
      const xPos = col * 100; // Reduced spacing for better fit
      const yPos = row * 100;

      // Example rigged logic
      const isRigged = Math.random() < 0.1;
      const challenge = isRigged
        ? { question: "Impossible question!", isImpossible: true }
        : { question: `Question for folder (${row}, ${col})`, isImpossible: false };

      nodes.push({
        id,
        type: "folderNode",
        position: { x: xPos, y: yPos },
        data: { challenge },
        draggable: false,
      });
    }
  }
  return nodes;
}

function generateGridEdges(rows, cols) {
  const edges = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sourceId = `${row}-${col}`;
      // Right neighbor
      if (col + 1 < cols) {
        const targetId = `${row}-${col + 1}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: "right",
          targetHandle: "left",
          type: "default",
          style: { stroke: "#00ff00", strokeWidth: 2 },
        });
      }
      // Down neighbor
      if (row + 1 < rows) {
        const targetId = `${row + 1}-${col}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "default",
          style: { stroke: "#00ff00", strokeWidth: 2 },
        });
      }
    }
  }
  return edges;
}

/** -------------- CREATE LOBBY -------------- */
router.post("/create", async (req, res) => {
  const { host_id } = req.body;
  try {
    const user = await User.findOne({ nickname: host_id });
    const existingLobbies = await Lobby.find({}, { lobbyCode: 1 });
    const existingCodes = new Set(existingLobbies.map((lobby) => lobby.lobbyCode));
    const newLobbyCode = generateLobbyCode(existingCodes);

    user.lobbyCode = newLobbyCode;
    await user.save();
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

/** -------------- JOIN LOBBY -------------- */
router.post("/join", async (req, res) => {
  const { lobbyCode, user_id } = req.body;
  try {
    const lobby = await Lobby.findOne({ lobbyCode });
    const user = await User.findOne({ nickname: user_id });
    if (!lobby) {
      return res.status(404).json({ message: "Lobby not found" });
    }
    if (!lobby.user_ids.includes(user_id)) {
      lobby.user_ids.push(user_id);
      await lobby.save();
    }

    user.lobbyCode = lobbyCode;
    await user.save();
    socketManager.getIo().to(lobbyCode).emit("updateUsers", {
      action: "join",
      user: user_id,
      users: lobby.user_ids,
    });
    res.status(200).json({ lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** -------------- LEAVE LOBBY -------------- */
router.post("/leave", async (req, res) => {
  const { lobbyCode, user_id } = req.body;
  try {
    const lobby = await Lobby.findOne({ lobbyCode });
    const user = await User.findOne({ nickname: user_id });

    user.lobbyCode = null;
    await user.save();
    if (!lobby) {
      return res.status(404).json({ message: "Lobby not found" });
    }
    lobby.user_ids = lobby.user_ids.filter((id) => id !== user_id);
    if (lobby.user_ids.length === 0) {
      await Lobby.deleteOne({ lobbyCode });
      socketManager.getIo().to(lobbyCode).emit("updateUsers", { action: "empty", users: [] });
      return res.status(200).json({ message: "Lobby deleted as it became empty." });
    }
    await lobby.save();
    socketManager.getIo().to(lobbyCode).emit("updateUsers", {
      action: "leave",
      user: user_id,
      users: lobby.user_ids,
    });
    res.status(200).json({ message: "Left lobby successfully", lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** -------------- CREATE GAME -------------- */
router.post("/:lobbyCode/createGame", async (req, res) => {
  const { lobbyCode } = req.params; // lobbyCode is a string
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User id is required" });
  }

  try {
    const lobby = await Lobby.findOne({ lobbyCode });
    if (!lobby) {
      return res.status(404).json({ message: "Lobby not found" });
    }

    if (lobby.host_id.trim().toLowerCase() !== user_id.trim().toLowerCase()) {
      return res.status(403).json({ message: "Only the host can start the game." });
    }

    // For demonstration: requiring at least 3 players
    if (!lobby.user_ids || lobby.user_ids.length < 2) {
      return res
        .status(400)
        .json({ message: "At least 3 players are required to start the game." });
    }

    lobby.in_game = true;
    await lobby.save();

    const rows = 2;
    const cols = 2;

    // Create the initial Game document
    const game = new Game({
      lobbyCode: lobbyCode,
      user_ids: lobby.user_ids,
      nodes: generateGridNodes(rows, cols),
      edges: generateGridEdges(rows, cols),
      rows,
      cols,
      host_id: lobby.host_id,
      turnOrder: shuffleArray(lobby.user_ids),
      imposters: getRandomElements(lobby.user_ids, 1), // 1 imposter for example
      currTurn: 0,
      phase: "APPOINT",
      location: "0-0",
      timeLimit: 600,
      startTime: new Date(),
      endTime: new Date(Date.now() + 600 * 1000),
    });

    // Save the new game
    await game.save();

    // Emit the gameStarted event with the correct game data
    socketManager.getIo().to(lobbyCode).emit("gameStarted", { lobbyCode, game });

    /** ----------------------------------------------------------------
     *  SET THE INITIAL TIMEOUT FOR APPOINT (so it doesn't last forever)
     * ----------------------------------------------------------------*/
    clearPhaseTimeout(lobbyCode);

    // The same 10s we used above (APPOINT_DURATION)
    game.phaseEndTime = Date.now() + APPOINT_DURATION;
    await game.save();

    // Broadcast the updated game (with phaseEndTime) so PhaseTimer can show
    socketManager.getIo().to(lobbyCode).emit("gameData", game);

    // Schedule the timeout. If the president doesn't appoint in time,
    // we forcibly pass to the next president (just a simple forced action).
    setPhaseTimeout(lobbyCode, "APPOINT", APPOINT_DURATION, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });
      if (!updatedGame || updatedGame.phase !== "APPOINT") {
        return; // Either the game was changed or doesn't exist
      }

      // Force pass to the next president
      updatedGame.currTurn =
        (updatedGame.currTurn + 1) % updatedGame.user_ids.length;

      // Keep it in APPOINT again with a fresh 10s
      updatedGame.phaseEndTime = Date.now() + APPOINT_DURATION;
      await updatedGame.save();

      socketManager.getIo().to(lobbyCode).emit("gameData", updatedGame);

      // Optionally, re-schedule APPOINT indefinitely until they appoint:
      clearPhaseTimeout(lobbyCode);
      setPhaseTimeout(lobbyCode, "APPOINT", APPOINT_DURATION, async () => {
        // Same forced pass logic again...
        const reUpdatedGame = await Game.findOne({ lobbyCode });
        if (!reUpdatedGame || reUpdatedGame.phase !== "APPOINT") return;
        reUpdatedGame.currTurn =
          (reUpdatedGame.currTurn + 1) % reUpdatedGame.user_ids.length;
        reUpdatedGame.phaseEndTime = Date.now() + APPOINT_DURATION;
        await reUpdatedGame.save();
        socketManager.getIo().to(lobbyCode).emit("gameData", reUpdatedGame);

        // ...and so on if you want to keep cycling
      });
    });

    return res.status(200).json({ message: "Game successfully started", game });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
