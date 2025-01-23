const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    lobbyCode: String,
    nodes: Array,
    edges: Array,
    user_ids: [String],
    host_id: String,
    imposters: Array,
    turnOrder: Array,
    currTurn: Number,
    appointedHacker: String,
    hacker: String,
    votes: Object,
    phase: String, 
});

module.exports = mongoose.model("Game", GameSchema);
