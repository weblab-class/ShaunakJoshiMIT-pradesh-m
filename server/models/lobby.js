const mongoose = require("mongoose"); // Add this line

const LobbySchema = new mongoose.Schema({
  lobbyCode: {
    type: String,
    unique: true, // Enforces unique constraint on lobbyCode
  },
  user_ids: [String],
  in_game: Boolean,
  host_id: String,
  imposters: Array,
  turnOrder: Array,
  timeLimit: { type: Number, default: 10 },
  gridSize: { type: Number, default: 3 },
});

module.exports = mongoose.model("Lobby", LobbySchema);
