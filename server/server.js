const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startWebSocketServer = require('./webSocket/WebsocketServer');
require('dotenv').config();

// Routes import
const { userRoutes } = require('./api/User/User.routes');
const { lobbyRoutes } = require('./api/Lobby/Lobby.routes');

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  console.log(`Successfully connected to MongoDB`);

  // start websocket server
  startWebSocketServer(process.env.WEBSOCKET_PORT);

  // Routes
  app.use('/api/user', userRoutes);
  app.use('/api/lobby', lobbyRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on port:`, PORT);
  });
});
