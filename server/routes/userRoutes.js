const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); 

router.post("/setNickname", async (req, res) => {
  const { googleid, nickname } = req.body;
  if (!nickname || nickname.trim().length === 0 || nickname.trim().length > 12) {
    return res.status(400).json({
      error: "Nickname must be between 1 and 12 characters."
    });
  }

  try {
    const user = await User.findOneAndUpdate(
      { googleid },
      { nickname: nickname.trim() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({
      message: "Nickname updated successfully.",
      nickname: user.nickname
    });
  } catch (error) {
    console.error("Error updating nickname:", error);
    res.status(500).json({ error: "Failed to update nickname." });
  }
});

module.exports = router;
