const express = require("express");
const router = express.Router();
const Lobby = require("../models/lobby.js");
const Game = require("../models/game.js");
const User = require("../models/user.js");

const socketManager = require("../server-socket");
const { setPhaseTimeout, clearPhaseTimeout } = require("../utils/phaseTimeouts.js");

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
      const xPos = col * 100;
      const yPos = row * 100;

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

router.post("/create", async (req, res) => {
  const { host_id } = req.body;
  try {
    const user = await User.findOne({ nickname: host_id });
    const existingLobbies = await Lobby.find({}, { lobbyCode: 1 });
    const existingCodes = new Set(existingLobbies.map((l) => l.lobbyCode));
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
      host_id: lobby.host_id,
    });
    res.status(200).json({ lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
      host_id: lobby.host_id,
    });
    res.status(200).json({ message: "Left lobby successfully", lobby });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:lobbyCode/createGame", async (req, res) => {
  const { lobbyCode } = req.params;
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

    if (!lobby.user_ids || lobby.user_ids.length < 2) {
      return res.status(400).json({ message: "Need at least 2 players to start the game." });
    }

    lobby.in_game = true;
    await lobby.save();

    const chosenRows = lobby.gridSize || 3;
    const chosenCols = chosenRows;
    const chosenTimeLimit = lobby.timeLimit || 10;

    const nodes = generateGridNodes(chosenRows, chosenCols);
    const edges = generateGridEdges(chosenRows, chosenCols);

    const imposters = getRandomElements(lobby.user_ids, 1);
    const turnOrder = shuffleArray(lobby.user_ids);

    const game = new Game({
      lobbyCode,
      user_ids: lobby.user_ids,
      host_id: lobby.host_id,
      nodes,
      edges,
      rows: chosenRows,
      cols: chosenCols,
      imposters,
      turnOrder,
      currTurn: 0,
      phase: "APPOINT",
      location: "0-0",
      timeLimit: chosenTimeLimit * 60,
      startTime: new Date(),
      endTime: new Date(Date.now() + chosenTimeLimit * 60 * 1000),
    });

    await game.save();

    
    socketManager.getIo().to(lobbyCode).emit("gameStarted", { lobbyCode, game });

    const APPOINT_DURATION = 25000;
    game.phaseEndTime = Date.now() + APPOINT_DURATION;
    await game.save();
    socketManager.getIo().to(lobbyCode).emit("gameData", game);

    clearPhaseTimeout(lobbyCode);
    setPhaseTimeout(lobbyCode, "APPOINT", APPOINT_DURATION, async () => {
      const updatedGame = await Game.findOne({ lobbyCode });
      if (!updatedGame || updatedGame.phase !== "APPOINT") return;

      updatedGame.currTurn = (updatedGame.currTurn + 1) % updatedGame.user_ids.length;
      updatedGame.phaseEndTime = Date.now() + APPOINT_DURATION;
      await updatedGame.save();

      socketManager.getIo().to(lobbyCode).emit("gameData", updatedGame);

    });

    return res.status(200).json({ message: "Game successfully started", game });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/updateSettings", async (req, res) => {
  const { lobbyCode, userNickname, timeLimit, gridSize } = req.body;

  try {
    const lobby = await Lobby.findOne({ lobbyCode });
    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }

    if (lobby.host_id !== userNickname) {
      return res.status(403).json({ error: "Only the lobby host can update settings" });
    }

    if (timeLimit !== undefined) {
      const t = Number(timeLimit);
      if (isNaN(t) || t < 1 || t > 60) {
        return res.status(400).json({ error: "timeLimit must be an integer between 1 and 60" });
      }
      lobby.timeLimit = t;
    }

    if (gridSize !== undefined) {
      const g = Number(gridSize);
      if (![3, 9].includes(g)) {
        return res.status(400).json({ error: "gridSize must be 3 or 9" });
      }
      lobby.gridSize = g;
    }

    await lobby.save();

    socketManager.getIo().to(lobbyCode).emit("lobbyData", lobby);

    res.status(200).json({ message: "Lobby settings updated", lobby });
  } catch (err) {
    console.error("Error in /updateSettings:", err);
    res.status(500).json({ error: "Failed to update lobby settings" });
  }
});

module.exports = router;
