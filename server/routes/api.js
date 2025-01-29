// api.js

const express = require("express");
const auth = require("../auth");
const socketManager = require("../server-socket");
const User = require("../models/user");

const router = express.Router();

// POST /api/login
router.post("/login", auth.login);

// POST /api/logout
router.post("/logout", auth.logout);

// GET /api/whoami
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // Not logged in
    return res.send({});
  }
  // If logged in, send the user doc
  res.send(req.user);
});

// GET /api/user?userid=...
router.get("/user", (req, res) => {
  const { userid } = req.query;
  if (!userid) {
    return res.status(400).send("User ID is required");
  }
  User.findById(userid)
    .then((user) => {
      if (!user) {
        return res.status(404).send("User Not Found");
      }
      res.send(user);
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      res.status(500).send("Internal Server Error");
    });
});

// POST /api/initsocket
router.post("/initsocket", (req, res) => {
  if (req.user) {
    socketManager.addUser(
      req.user,
      socketManager.getSocketFromSocketID(req.body.socketid)
    );
  }
  res.send({});
});

// fallback for undefined routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
