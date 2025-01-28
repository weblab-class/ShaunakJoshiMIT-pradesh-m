const validator = require("./validator");
validator.checkSetup();

require("dotenv").config();

const http = require("http");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestsRoutes");
const lobbyRoutes = require("./routes/lobbyRoutes.js"); // <== important
const gameRoutes = require("./routes/gameRoutes.js");
const api = require("./routes/api.js");
const auth = require("./auth");
const socketManager = require("./server-socket");

// For example:
const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = "findthemoles";

mongoose.set("strictQuery", false);
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

const app = express();
app.use(cors());

app.use(validator.checkRoutes);
app.use(express.json());

app.use(
  session({
    secret: "session-secret", // or use process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: false,
  })
);

// fill req.user if logged in
app.use(auth.populateCurrentUser);

// MOUNT OUR ROUTES
app.use("/api/user", userRoutes);        // e.g. /api/user/setNickname
app.use("/api/requests", requestRoutes);
app.use("/api/lobby", lobbyRoutes);      // includes /updateSettings
app.use("/api/game", gameRoutes);
app.use("/api", api);

app.get("/debug", (req, res) => {
  res.send("Server is working!");
});

// serve the React app
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"), (err) => {
    if (err) {
      console.log("Error sending index.html:", err.status || 500);
      res.status(err.status || 500).send("Error: build missing?");
    }
  });
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    console.log("Server errored:", err);
  }
  res.status(status).send({
    status,
    message: err.message,
  });
});

const port = 3000;
const server = http.Server(app);
socketManager.init(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
