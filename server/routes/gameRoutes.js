const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");
const { getSocketFromUserID, getIo } = require("../server-socket");
const Game = require("../models/game");
const Lobby = require("../models/lobby");
const User = require("../models/user");

router.post("/appoint", async (req, res) => {
    console.log("Reached appoint endpoint");
    const { user_id, lobbyCode, appointee } = req.body;
    console.log(user_id)

    try {
        const game = await Game.findOne({ lobbyCode });
        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentPresidentNickname = game.turnOrder[game.currTurn];
        if (user.nickname !== currentPresidentNickname) {
            return res.status(403).json({ error: "Only the current president can appoint" });
        }

        console.log(appointee)
        const appointeeUser = await User.findOne( { nickname: appointee } );
        if (!appointeeUser) {
            return res.status(404).json({ error: "Appointee user not found" });
        }

        console.log(appointeeUser)
        const isAppointeeInGame = game.user_ids.includes(appointeeUser.nickname);

        if (!isAppointeeInGame) {
            return res.status(400).json({ error: "Appointee is not in the game" });
        }

        game.appointedHacker = appointeeUser.nickname;
        await game.save();
        const io = getIo();
        io.to(lobbyCode).emit("hackerAppointed", { appointee: appointeeUser.nickname });
        res.status(200).json({ message: "Hacker appointed successfully", appointee });
    } catch (error) {
        console.error("Error in appoint:", error);
        res.status(500).json({ error: "Failed to appoint hacker" });
    }
});

router.post("/vote", async (req, res) => {
    const { user_id, lobbyCode, decision} = req.body;
    try {
        const game = await Game.findOne({ lobbyCode });
        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }
        if (!game.appointedHacker) {
            return res.status(400).json({ error: "No hacker has been appointed" });
        }

        if (!game.votes) {
            game.votes = {};
        }
        if (game.votes[user_id]) {
            return res.status(400).json({ error: "You have already cast your vote" });
        }
        game.votes[user_id] = decision;
        await game.save();

        const io = getIo();
        io.to(lobbyCode).emit("voteCast", { user_id, decision });

        if (Object.keys(game.votes).length === game.user_ids.length) {
            const votes = Object.values(game.votes);
            const approve = votes.filter((vote) => vote === "yes").length;
            const reject = votes.filter((vote) => vote === "no").length;
            let result;
            if (approve >= reject) {
                result = {outcome: 'approved', hacker: game.appointedHacker}
                game.hacker = game.appointedHacker;
                game.appointedHacker = null;
                game.votes = {};

            } else {
                result = {outcome: 'rejected'}
                game.appointedHacker = null;
                game.votes = {}
            }
            await game.save();
            io.to(lobbyCode).emit("voteResults", result);
            res.status(200).json({ message: "Vote cast successfully", result });
        } else {
            res.status(200).json({message: "Vote cast successfully"});
        }
    } catch (error) {
        console.error("Error in vote:", error);
        res.status(500).json({error: "Failed to cast"})
    }

        });


module.exports = router;
