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
const lobbyRoutes = require("./routes/lobbyRoutes.js"); // <== important
const gameRoutes = require("./routes/gameRoutes.js");
const api = require("./routes/api.js");
const auth = require("./auth");
const socketManager = require("./server-socket");

// Environment Variables
const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = "findthemoles";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://find-the-moles.onrender.com/"; // Add your Render app URL in .env
const SESSION_SECRET = process.env.SESSION_SECRET || "session-secret";

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

// CORS Configuration
app.use(
  cors({
    origin: CLIENT_ORIGIN,      // e.g., "https://yourapp.onrender.com"
    credentials: true,          // Allow cookies to be sent
  })
);

// Middleware
app.use(validator.checkRoutes);
app.use(express.json());

// Session Configuration
app.use(
  session({
    secret: SESSION_SECRET,     // Use a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Populate req.user if logged in
app.use(auth.populateCurrentUser);

// Mount Routes
app.use("/api/user", userRoutes);        // e.g. /api/user/setNickname
app.use("/api/requests", requestRoutes);
app.use("/api/lobby", lobbyRoutes);      // includes /updateSettings
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
