const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.js");

router.post("/setNickname", async (req, res) => {
  const { userId, nickname } = req.body;
  console.log("Received setNickname request:", req.body);

  if (!nickname || nickname.length === 0 || nickname.length > 12) {
    return res.status(400).json({ error: "Nickname must be between 1 and 12 characters" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for userId:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    user.nickname = nickname.trim();
    await user.save();

    return res.status(200).json({
      message: "Nickname updated successfully.",
      nickname: user.nickname,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Nickname is already taken." });
    }
    console.error("Error updating nickname:", error);
    return res.status(500).json({ error: "Failed to update nickname." });
  }
});

module.exports = router;
