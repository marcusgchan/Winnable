const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const startWebSocketServer = require("./webSocket/WebsocketServer");
require("dotenv").config();

// Routes import
const { userRoutes } = require("./api/User/User.routes");
const { lobbyRoutes } = require("./api/Lobby/Lobby.routes");
const { authRoutes } = require("./auth/routes");

const app = express();

const store = new MemoryStore({
  checkPeriod: 86400000, // prune expired entries every 24h
});

const PORT = process.env.PORT;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: false, sameSite: true, maxAge: 60000 * 60 * 24 },
    store,
  }),
);

app.use((req, res, next) => {
  // Add store to req object
  req.store = store;

  // Attach user to req.session
  if (req.session.id) {
    req.store.get(req.session.id, (_, session) => {
      if (session) {
        req.session.user = session.user;
      }
      next();
    });
  } else {
    next();
  }
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log(`Successfully connected to MongoDB`);
    // start websocket server
    startWebSocketServer(process.env.WEBSOCKET_PORT);
    // Routes
    app.use("/api/user", userRoutes);
    app.use("/api/lobby", lobbyRoutes);
    app.use("/api/auth", authRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err}`);
  });

module.exports = { store };
