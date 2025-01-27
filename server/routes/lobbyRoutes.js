const express = require("express");
const Lobby = require("../models/lobby.js");
const router = express.Router();
const socketManager = require("../server-socket");
const Game = require("../models/game.js");


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

  // Create a copy of the array to avoid mutating the original
  const shuffled = array.slice();

  // Perform a partial Fisher-Yates shuffle to get the first n random elements
  for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * (shuffled.length - i)) + i;
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  // Return the first n elements of the shuffled array
  return shuffled.slice(0, n);
}

function generateGridNodes(rows, cols) {
  const nodes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}-${col}`;
      // Evenly spaced - adjust as needed
      const xPos = col * 100; // Reduced spacing for better fit
      const yPos = row * 100;

      // Example rigged logic
      const isRigged = Math.random() < 0.1;
      const challenge = isRigged
        ? { question: 'Impossible question!', isImpossible: true }
        : { question: `Question for folder (${row}, ${col})`, isImpossible: false };

      nodes.push({
        id,
        type: 'folderNode', // Reference to your custom node
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

      // Right Neighbor
      if (col + 1 < cols) {
        const targetId = `${row}-${col + 1}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'right',   // Connect to the right handle of the source
          targetHandle: 'left',    // Connect to the left handle of the target
          type: 'default',
          style: { stroke: '#00ff00', strokeWidth: 2 },
        });
      }

      // Down Neighbor
      if (row + 1 < rows) {
        const targetId = `${row + 1}-${col}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',  // Optional: Define additional handles if needed
          targetHandle: 'top',     // Optional: Define additional handles if needed
          type: 'default',
          style: { stroke: '#00ff00', strokeWidth: 2 },
        });
      }
    }
  }
  return edges;
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
      console.log("Lobby host_id:", JSON.stringify(lobby.host_id));
      console.log("User id from request:", JSON.stringify(user_id));
      return res.status(403).json({ message: "Only the host can start the game." });
    }

    if (!lobby.user_ids || lobby.user_ids.length < 2) { // Adjusted to match the error message
      return res.status(400).json({ message: "At least 3 players are required to start the game." });
    }

    lobby.in_game = true;
    await lobby.save();

    const game = new Game({
      lobbyCode: lobbyCode, // Correctly assign the string
      user_ids: lobby.user_ids,
      nodes: generateGridNodes(2, 2),
      edges: generateGridEdges(2, 2),
      rows: 2,
      cols: 2,
      host_id: lobby.host_id,
      turnOrder: shuffleArray(lobby.user_ids),
      imposters: getRandomElements(lobby.user_ids, 1),
      currTurn: 0,
      phase: "APPOINT",
      location: "0-0",
      timeLimit: 600,
      startTime: new Date(),
      endTime: new Date(Date.now() + 600*1000),
    });

    // Save the game to the database
    await game.save();

    // Emit the gameStarted event with the correct game data
    socketManager.getIo().to(lobbyCode).emit("gameStarted", { lobbyCode, game });

    res.status(200).json({ message: "Game successfully started", game });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


module.exports = router;
