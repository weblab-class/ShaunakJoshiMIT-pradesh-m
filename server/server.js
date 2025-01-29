// server.js

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
const lobbyRoutes = require("./routes/lobbyRoutes");
const gameRoutes = require("./routes/gameRoutes");
const api = require("./routes/api");
const auth = require("./auth");
const socketManager = require("./server-socket");

// Environment Variables
const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = "findthemoles";
const SESSION_SECRET = process.env.SESSION_SECRET || "session-secret";

// If you want to allow both dev (localhost) + production:
const allowedOrigins = [
  "http://localhost:5173",
  "https://find-the-moles.onrender.com",
];

// Connect to MongoDB
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

// CORS Setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps, curl, etc.
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

app.use(validator.checkRoutes);
app.use(express.json());

// Session Configuration
app.use(
  session({
    secret: SESSION_SECRET, // use a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Populate req.user if logged in (auth.populateCurrentUser sets req.user = req.session.user)
app.use(auth.populateCurrentUser);

// Mount Routes
app.use("/api/user", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use("/api/game", gameRoutes);
app.use("/api", api);

app.get("/debug", (req, res) => {
  res.send("Server is working!");
});

// Serve the React app
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

// Error Handler
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

const port = process.env.PORT || 10000; // Use environment PORT
const server = http.Server(app);
socketManager.init(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
