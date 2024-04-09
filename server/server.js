const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const startWebSocketServer = require('./webSocket/WebsocketServer');
require('dotenv').config();

// Routes import
const { userRoutes } = require('./api/User/User.routes');
const { lobbyRoutes } = require('./api/Lobby/Lobby.routes');
const { authRoutes } = require('./auth/routes');
const { gameRoutes } = require('./gameApi/routes');

// Store
const { store } = require('./auth/constants');

const app = express();

const PORT = process.env.PORT;

const sessionParser = session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: false, sameSite: 'none', maxAge: 86400000, unset: 'destroy' }, // not sure if should set to destroy
  store,
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionParser);

app.use((req, res, next) => {
  // Attach user to req.session from mongo session store
  if (req.session.id) {
    store.get(req.session.id, (error, session) => {
      if (session) {
        req.session.user = session.user;
      }
      next();
    });
  } else {
    next();
  }
});

const server = http.createServer(app);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log(`Successfully connected to MongoDB`);
    // start websocket server
    startWebSocketServer(sessionParser, server);
    // Routes
    app.use('/api/user', userRoutes);
    app.use('/api/lobby', lobbyRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/game', gameRoutes);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to MongoDB: ${err}`);
  });
