const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    lobbyCode: {
        type: String,
        unique: true, // Enforces unique constraint on gameCode
    },
    nodes: Array,
    edges: Array,
    user_ids: [String],
    host_id: String,
    imposters: Array,
    turnOrder: Array,
    currTurn: Number, 
});

module.exports = mongoose.model("Game", GameSchema);
