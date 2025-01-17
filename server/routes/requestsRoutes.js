

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../auth");

const User = require("../models/user")
const Request = require("../models/friendrequests");

function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
  }
  return randomString;
}


/* FRIEND REQUESTS ROUTING */
router.post("/sendRequest", async (req, res) => {


    console.log(req.body)

    const fromUser = await User.findById(req.body.from);
    const toUser = await User.findOne({nickname: req.body.to});


    if (!fromUser || !toUser) {
      return res.status(404).send("User not found");
    }
    console.log("toUser:", toUser);

    const existingRequest = await Request.findOne({from: req.body.from, to: toUser._id, status: "pending"})
    const alreadyFriends = await fromUser.friends.includes(toUser._id);

    if (existingRequest || alreadyFriends) {
      return res.status(400).send("Friend request already sent or already friends")
    }

    const newRequest = new Request({
      _id: generateRandomString(),
      from: req.body.from,
      to: toUser._id,
      status: "pending"
    })

    newRequest.save().then((newRequest) => res.send(newRequest))
    .catch((err) => {
      res.status(500).send("Internal Server Error");
    });

  });



  router.post("/sendRequest/accept", auth.ensureLoggedIn, async (req, res) => {
    const { from, to } = req.body;

    const fromUserObj = await User.findOne({nickname: from})
    const toUserObj = await User.findById(to)
    const friendRequest = await Request.findOne({from: fromUserObj._id, to: to, status: "pending"});

    if (!friendRequest || friendRequest.status !== "pending") {
      return res.status(404).send("Friend request not found or already handled");
    }



    fromUserObj.friends.push(toUserObj._id);
    toUserObj.friends.push(fromUserObj._id);

    await fromUserObj.save();
    await toUserObj.save();

    friendRequest.status = "accepted";
    await friendRequest.save();
    // res.status(200).json({message: "Friend request accepted"})
    res.send("Friend request accepted");
  });

  router.post("/sendRequest/reject", auth.ensureLoggedIn, async (req, res) => {
    const { requestId } = req.body;
    const friendRequest = await Request.findById(requestId);

    if (!friendRequest || friendRequest.status !== "pending") {
      return res.status(404).send("Friend request not found or already handled");
    }

    friendRequest.status = "rejected";
    await friendRequest.save();
    res.send("Friend request rejected")
  });

  router.get("/sendRequest/:userId", auth.ensureLoggedIn, async (req, res) => {
    const { userId } = req.params;

    const pendingRequests = Request.find({ to: userId, status: "pending"});
    res.json(pendingRequests)

  })


  module.exports = router;
