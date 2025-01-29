
const express = require("express");
const auth = require("../auth");
const socketManager = require("../server-socket");
const User = require("../models/user");

const router = express.Router();

router.post("/login", auth.login);

router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  res.send(req.user);
});

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

router.post("/initsocket", (req, res) => {
  if (req.user) {
    socketManager.addUser(
      req.user,
      socketManager.getSocketFromSocketID(req.body.socketid)
    );
  }
  res.send({});
});

router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
