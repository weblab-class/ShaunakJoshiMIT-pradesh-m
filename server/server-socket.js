// server-socket.js

const Lobby = require("./models/lobby.js");
const Game = require("./models/game.js");

// Socket.IO reference
let io;

/**
 * These maps store the relationship between userIds and socketIds.
 * Key idea: Always store userId as the key for userToSocketMap.
 */
const userToSocketMap = {};
const socketToUserMap = {};

/**
 * Return the socket associated with a given userId
 */
const getSocketFromUserID = (userId) => {
  return userToSocketMap[userId];
};

/**
 * Return the userId associated with a given socketId
 */
const getUserFromSocketID = (socketId) => {
  return socketToUserMap[socketId];
};

/**
 * Add/update the mapping: userId -> socket, and socket.id -> userId.
 * If the user was already connected, disconnect the old socket.
 */
function addUser(userId, socket) {
  if (!userId) return;

  // If user was already connected, disconnect the old socket
  if (userToSocketMap[userId] && userToSocketMap[userId].id !== socket.id) {
    userToSocketMap[userId].disconnect();
    delete socketToUserMap[userToSocketMap[userId].id];
  }

  userToSocketMap[userId] = socket;
  socketToUserMap[socket.id] = userId;
}

/**
 * Remove the user <-> socket mapping when a user disconnects or leaves.
 */
function removeUser(userId, socket) {
  if (userId) {
    delete userToSocketMap[userId];
  }
  delete socketToUserMap[socket.id];
}

/**
 * Optional utility: Return the socket object from a socketId
 */
function getSocketFromSocketID(socketId) {
  return io.sockets.sockets.get(socketId);
}

/**
 * Initialize Socket.IO on the given HTTP server.
 */
function init(httpServer) {
  io = require("socket.io")(httpServer, {
    cors: {
      // In production, replace "*" with your real client domain or an allowedOrigin function
      origin: [
        "http://localhost:5173",
        "https://find-the-moles.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /**
     * If your frontend calls something like:
     *   socket.emit("initUser", userId)
     * you can store that userId -> socket mapping here
     */
    socket.on("initUser", (userId) => {
      console.log(`Initializing user ${userId} on socket ${socket.id}`);
      addUser(userId, socket);
    });

    /**
     * Example joinLobby event, which you may call from the client as:
     *   socket.emit("joinLobby", lobbyCode, userId)
     */
    socket.on("joinLobby", async (lobbyCode, userId) => {
      console.log(`Socket ${socket.id} joined lobby ${lobbyCode} as userId=${userId}`);

      // 1. Add user to the userToSocketMap by userId
      addUser(userId, socket);

      // 2. Join the socket.io room
      socket.join(lobbyCode);

      // 3. Optionally update the Lobby doc in MongoDB
      try {
        const lobby = await Lobby.findOne({ lobbyCode });
        if (lobby) {
          // If you want to store the user’s nickname, fetch it from your DB or pass it in
          if (!lobby.user_ids.includes(userId)) {
            lobby.user_ids.push(userId);
            await lobby.save();
            console.log(`UserId ${userId} added to lobby ${lobbyCode}`);
          }
          // Let everyone in the lobby know the new user joined
          io.to(lobbyCode).emit("updateUsers", {
            action: "join",
            user: userId,
            users: lobby.user_ids,
          });
        } else {
          console.log(`Lobby ${lobbyCode} not found.`);
        }
      } catch (error) {
        console.error("Error in joinLobby:", error);
      }
    });

    /**
     * Example leaveLobby event
     */
    socket.on("leaveLobby", async (lobbyCode, userId) => {
      console.log(`Socket ${socket.id} left lobby ${lobbyCode} (userId=${userId})`);

      // 1. Remove user from your map
      removeUser(userId, socket);

      // 2. Leave the socket.io room
      socket.leave(lobbyCode);

      // 3. Remove user from the Lobby doc in MongoDB
      try {
        const lobby = await Lobby.findOneAndUpdate(
          { lobbyCode },
          { $pull: { user_ids: userId } },
          { new: true } // Return the updated doc
        );

        if (lobby) {
          if (lobby.user_ids.length === 0) {
            // If no users left, delete the lobby
            await Lobby.deleteOne({ lobbyCode });
            io.to(lobbyCode).emit("updateUsers", { action: "empty", users: [] });
            console.log(`Lobby ${lobbyCode} deleted as it became empty.`);
          } else {
            // Emit updated user list
            io.to(lobbyCode).emit("updateUsers", {
              action: "leave",
              user: userId,
              users: lobby.user_ids,
            });
            console.log(`UserId ${userId} removed from lobby ${lobbyCode}`);
          }
        } else {
          console.log(`Lobby ${lobbyCode} not found or already deleted.`);
        }
      } catch (error) {
        console.error("Error in leaveLobby:", error);
      }
    });

    /**
     * Example for retrieving/refreshing game data
     */
    socket.on("getGameData", async (lobbyCode) => {
      console.log(`getGameData event for lobbyCode: ${lobbyCode}`);
      try {
        const game = await Game.findOne({ lobbyCode });
        if (game) {
          // Example: check if time is up
          if (Date.now() >= new Date(game.endTime).getTime()) {
            game.winner = "FBI";
            game.phase = "END";
            await game.save();
          }
          socket.emit("gameData", game);
        } else {
          console.log(`No game found for lobbyCode: ${lobbyCode}`);
          socket.emit("errorMessage", { message: "No game data found." });
        }
      } catch (error) {
        console.error("Error in getGameData:", error);
        socket.emit("errorMessage", { message: "Error retrieving game data." });
      }
    });

    /**
     * Example for advancing the turn in a game
     */
    socket.on("nextTurn", async (lobbyCode) => {
      try {
        const game = await Game.findOne({ lobbyCode });
        if (game) {
          game.currTurn = (game.currTurn + 1) % game.user_ids.length;
          await game.save();
          io.to(lobbyCode).emit("gameData", game);
        } else {
          console.log(`No game data found for lobbyCode: ${lobbyCode}`);
          socket.emit("errorMessage", { message: "No game data found for this lobby." });
        }
      } catch (error) {
        console.error("Error in nextTurn:", error);
        socket.emit("errorMessage", { message: "Error retrieving game data." });
      }
    });

    /**
     * When a socket disconnects
     */
    socket.on("disconnect", (reason) => {
      const userId = getUserFromSocketID(socket.id);
      console.log(`Socket disconnected: ${socket.id} (UserId: ${userId}). Reason: ${reason}`);
      removeUser(userId, socket);
    });
  });
}

module.exports = {
  init,
  // The helper functions in case other routes need them
  addUser,
  removeUser,
  getSocketFromUserID,
  getUserFromSocketID,
  getSocketFromSocketID,
  getIo: () => io,
};
