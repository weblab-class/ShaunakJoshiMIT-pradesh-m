


const User = require("../models/user")
const Request = require("../models/friendrequests");



/* FRIEND REQUESTS ROUTING */
router.post("/Friend-Requests", async (req, res) => {

    const fromUser = await User.findById(req.from);
    const toUser = await User.findOne({name: req.to});


    if (!fromUser || !toUser) {
      return res.status(404).send("User not found");
    }
    console.log("toUser:", toUser);

    const existingRequest = await friendrequests.findOne({from: req.from, to: req.to, status: "pending"})
    const alreadyFriends = await fromUser.friends.includes(req.to);

    if (existingRequest || alreadyFriends) {
      return res.status(400).send("Friend request already sent or already friends")
    }

    const newRequest = new Request({
      _id: generateRandomString(),
      from: req.from,
      to: toUser._id,
      status: "pending"
    })

    newRequest.save().then((newRequest) => res.send(newRequest));

  });

  router.post("/Friend-Requests/accept", auth.ensureLoggedIn, async (req, res) => {
    const { requestId } = req.body;
    const friendRequest = await friendrequests.findById(requestId);

    if (!friendRequest || friendRequest.status !== "pending") {
      return res.status(404).send("Friend request not found or already handled");
    }

    const fromUser = await User.findById(friendRequest.from);
    const toUser = await User.findById(friendRequest.to);

    fromUser.friends.push(toUser);
    toUser.friends.push(fromUser);

    await fromUser.save();
    await toUser.save();

    friendRequest.status = "accepted";
    await friendRequest.save();
    res.send("Friend request accepted");
  });

  router.post("/Friend-Requests/reject", auth.ensureLoggedIn, async (req, res) => {
    const { requestId } = req.body;
    const friendRequest = await friendrequests.findById(requestId);

    if (!friendRequest || friendRequest.status !== "pending") {
      return res.status(404).send("Friend request not found or already handled");
    }

    friendRequest.status = "rejected";
    await friendRequest.save();
    res.send("Friend request rejected")
  });

  router.get("/Friend-Requests/:userId", auth.ensureLoggedIn, async (req, res) => {
    const { userId } = req.params;

    const pendingRequests = friendrequests.find({ to: userId, status: "pending"});
    res.json(pendingRequests)

  })
