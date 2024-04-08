const express = require('express');
const gameRoutes = express.Router();
const gameHandlers = require('./games.handlers');
const { requireLogin } = require('../auth/auth.middleware'); 

gameRoutes.get('/search-games/:searchString', requireLogin, gameHandlers.searchGames);

module.exports = { gameRoutes };