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
    location: {type: String, default: "0-0"},
    rows: Number,
    cols: Number,
    triviaQuestion: Object,
    nextLocation: {type: String},
    hackerAnswer: String,
    winner: String,
    timeLimit: Number,
    startTime: Date,
    endTime: Date,
    phaseTimeLimits: Number
});

module.exports = mongoose.model("Game", GameSchema);
