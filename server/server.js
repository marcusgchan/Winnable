const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session')
const startWebSocketServer = require('./webSocket/WebsocketServer');
require('dotenv').config();

// Routes import
const { userRoutes } = require('./api/User/User.routes');
const { lobbyRoutes } = require('./api/Lobby/Lobby.routes');
const { authRoutes } = require('./auth/routes');

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000*60*24 },
}))

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  console.log(`Successfully connected to MongoDB`);
  // start websocket server
  startWebSocketServer(process.env.WEBSOCKET_PORT);
    // Routes
  app.use('/api/user', userRoutes);
  app.use('/api/lobby', lobbyRoutes);
  app.use('/api/auth', authRoutes)

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  }).catch((err) => {
    console.log(`Error connecting to MongoDB: ${err}`);
});
