const express = require('express');
const lobbyRoutes = express.Router();

const lobbyHandlers = require('./Lobby.handlers');
const { requireLogin } = require('../../auth/auth.middleware')

// POST /api/lobby - Create a new lobby
lobbyRoutes.post('/', requireLogin, lobbyHandlers.createLobby);

// GET /api/lobby - Get all lobbies
lobbyRoutes.get('/', lobbyHandlers.getAllLobbies);

// GET /api/lobby/id - Get a lobby with given ID
lobbyRoutes.get('/:id', lobbyHandlers.getLobby);

// PUT /api/lobby/id - Update a lobby with given ID
lobbyRoutes.put('/:id', lobbyHandlers.updateLobby);

// DELETE /api/lobby/id - Delete a lobby with given ID
lobbyRoutes.delete('/:id', lobbyHandlers.deleteLobby);

module.exports = { lobbyRoutes };
