// server-socket.js
const Lobby = require("./models/lobby.js");
const Game = require("./models/game.js");
let io;

const userToSocketMap = {};
const socketToUserMap = {};

const getSocketFromUserID = (user) => userToSocketMap[user];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];

const addUser = (user, socket) => {
  if (userToSocketMap[user] && userToSocketMap[user].id !== socket.id) {
    userToSocketMap[user].disconnect();
    delete socketToUserMap[userToSocketMap[user].id];
  }
  userToSocketMap[user] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user];
  delete socketToUserMap[socket.id];
};

const getSocketFromSocketID = (socketId) => {
  return io.sockets.sockets.get(socketId);
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("joinLobby", async (lobbyCode, user) => {
        socket.join(lobbyCode);
        console.log(`Socket ${socket.id} joined lobby ${lobbyCode} as ${user}`);
        addUser(user, socket);
        try {
          const lobby = await Lobby.findOne({ lobbyCode });
          if (lobby) {
            if (!lobby.user_ids.includes(user)) {
              lobby.user_ids.push(user);
              await lobby.save();
              console.log(`User ${user} added to lobby ${lobbyCode}`);
            }
            io.to(lobbyCode).emit("updateUsers", {
              action: "join",
              user,
              users: lobby.user_ids,
            });
          } else {
            console.log(`Lobby ${lobbyCode} not found.`);
          }
        } catch (error) {
          console.error("Error in joinLobby:", error);
        }
      });

      socket.on("leaveLobby", async (lobbyCode, user) => {
        socket.leave(lobbyCode);
        console.log(`Socket ${socket.id} left lobby ${lobbyCode} as ${user}`);
        removeUser(user, socket);
        try {
          const lobby = await Lobby.findOne({ lobbyCode });
          if (lobby) {
            lobby.user_ids = lobby.user_ids.filter((id) => id !== user);
            if (lobby.user_ids.length === 0) {
              await Lobby.deleteOne({ lobbyCode });
              io.to(lobbyCode).emit("updateUsers", { action: "empty", users: [] });
              console.log(`Lobby ${lobbyCode} deleted as it became empty.`);
            } else {
              await lobby.save();
              io.to(lobbyCode).emit("updateUsers", {
                action: "leave",
                user,
                users: lobby.user_ids,
              });
              console.log(`User ${user} removed from lobby ${lobbyCode}`);
            }
          } else {
            console.log(`Lobby ${lobbyCode} not found.`);
          }
        } catch (error) {
          console.error("Error in leaveLobby:", error);
        }
      });

      socket.on("initUser", (userId) => {
        console.log(`Initializing user ${userId} on socket ${socket.id}`);
        addUser(userId, socket);
      });

      socket.on("getGameData", async (lobbyCode) => {
        console.log(`getGameData event received for lobbyCode: ${lobbyCode}`);
        try {
          const game = await Game.findOne({ lobbyCode });
          if (game) {
            function isTimeUp(game) {
              return Date.now() >= new Date(game.endTime).getTime();
            }
            if (isTimeUp(game)) {
              game.winner = "FBI";
              game.phase = "END";
              await game.save();
            }
            console.log(`Game data found for lobbyCode: ${lobbyCode}`);
            socket.emit("gameData", game);
          } else {
            console.log(`No game data found for lobbyCode: ${lobbyCode}`);
            socket.emit("errorMessage", { message: "No game data found for this lobby." });
          }
        } catch (error) {
          console.error("Error in getGameData:", error);
          socket.emit("errorMessage", { message: "Error retrieving game data." });
        }
      });

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

      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        console.log(`Socket disconnected: ${socket.id} (User: ${user}). Reason: ${reason}`);
        removeUser(user, socket);
      });
    });
  },

  addUser,
  removeUser,
  getSocketFromUserID,
  getUserFromSocketID,
  getSocketFromSocketID,
  getIo: () => io,
};
