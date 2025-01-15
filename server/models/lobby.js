const mongoose = require("mongoose");

const LobbySchema = new mongoose.Schema({
  lobby_id: String,
  user_ids: [String],
  in_game: Boolean,
  host_id: String,
});

module.exports = mongoose.model("lobby", LobbySchema);