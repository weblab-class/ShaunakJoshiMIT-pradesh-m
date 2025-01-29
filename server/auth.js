// auth.js

const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");

// create a new OAuth client used to verify google sign-in
// TODO: replace with your own CLIENT_ID
const CLIENT_ID = "465324171584-jgurca8sfthunf91v7q4agppmuoir1d0.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(googleUser) {
  // the "sub" field is a unique Google identifier
  return User.findOne({ googleid: googleUser.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    // If not found, create a new user doc
    const generateUsername = (name) => {
      const clearName = name.replace(/\s+/g, "");
      const randomString = Array.from({ length: 4 }, () => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      return clearName + randomString;
    };

    const newUser = new User({
      name: googleUser.name,
      googleid: googleUser.sub,
      nickname: generateUsername(googleUser.name),
    });

    return newUser.save();
  });
}

function login(req, res) {
  verify(req.body.token)
    .then((googleUser) => getOrCreateUser(googleUser))
    .then((user) => {
      // persist user in the session
      req.session.user = user; // <-- CRITICAL: store user doc in session
      res.send(user);          // returns the user doc to the client
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      console.log('req.session.user', req.session.user)
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // populates "req.user" for convenience
  req.user = req.session.user || null;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }
  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
