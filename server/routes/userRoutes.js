const express = require("express");
const router = express.Router();
const User = require("../models/user.js");


router.post("/setNickname", async (req, res) => {
  const { userid, nickname } = req.body;

  if (!nickname || nickname.length === 0 || nickname.length > 12) {
    return res.status(400).send("Nickname must be between 1 and 12 characters");
  }

  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.nickname = nickname.trim();
    await user.save();
    return res.status(200).json({
      message: "Nickname updated successfully.",
      nickname: user.nickname,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send("Nickname is already taken.");
    }
    console.error("Error updating nickname:", error);
    return res.status(500).send("Failed to update nickname.");
  }
});



module.exports = router;
