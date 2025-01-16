const Lobby = require("./models/lobby.js");
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
              //delete the lobby if there are no users.
              await Lobby.deleteOne({ lobbyCode });
              io.to(lobbyCode).emit("updateUsers", {
                action: "empty",
                users: [],
              });
            } else {
              await lobby.save();
              io.to(lobbyCode).emit("updateUsers", {
                action: "leave",
                user,
                users: lobby.user_ids,
              });
            }
          } else {
            console.log(`Lobby ${lobbyCode} not found.`);
          }
        } catch (error) {
          console.error("Error in leaveLobby:", error);
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
  getIo: () => io,
};