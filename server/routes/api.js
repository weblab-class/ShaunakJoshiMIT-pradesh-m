/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
  }
  return randomString;
}

const User = require("../models/user")
const Request = require("../models/friendrequests");

const express = require("express");

// import models so we can interact with the database

// import authentication library
const auth = require("../auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("../server-socket");
const friendrequests = require("../models/friendrequests");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});


router.get("/user", (req, res) => {
  User.findById(req.query.userid).then((user) => {
    res.send(user);
  }).catch((err) => {
    // res.status(500).send("User Not Found")
    res.send(null);
  })

router.post("/addUser", auth.ensureLoggedIn, (req, res) => {
  const newUser = new User({
    name: req.name,
    username: req.username,
    googleid: req.googleid,
    friends: req.friends
  });

  newUser.save().then((user) => res.send(user));
});




})
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
