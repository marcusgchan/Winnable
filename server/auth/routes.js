const express = require('express');
const authRoutes = express.Router();
const authHandlers = require('./auth.handlers');
// Login for the first time
authRoutes.get('/login', authHandlers.login);

// Call back to 
authRoutes.get('/login-callback', authHandlers.callback);
// Then we want to save the user token info so we dont have to ask for authorization every time from discord

module.exports = { authRoutes };