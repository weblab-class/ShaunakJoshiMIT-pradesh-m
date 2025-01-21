const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const User = require("../models/user")


router.post("/answerChallenge", (req, res) => {
    const { triviaQuestion, answer, user_id } = req.body;
    socket.emit("challengeAnswered", {triviaQuestion, answer, user_id});
})
