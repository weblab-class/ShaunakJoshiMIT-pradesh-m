// server.js

const validator = require("./validator");
validator.checkSetup();

require("dotenv").config();

const http = require("http");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestsRoutes");
const lobbyRoutes = require("./routes/lobbyRoutes");
const gameRoutes = require("./routes/gameRoutes");
const api = require("./routes/api");
const auth = require("./auth");
const socketManager = require("./server-socket");

const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = "findthemoles";
const SESSION_SECRET = process.env.SESSION_SECRET || "session-secret";

const allowedOrigins = [
  "http://localhost:5173",
  "https://find-the-moles.onrender.com",
];

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

app.use(validator.checkRoutes);
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(auth.populateCurrentUser);

app.use("/api/user", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use("/api/game", gameRoutes);
app.use("/api", api);

app.get("/debug", (req, res) => {
  res.send("Server is working!");
});

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

const port = process.env.PORT || 10000;
const server = http.Server(app);
socketManager.init(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
