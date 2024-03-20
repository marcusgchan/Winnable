const express = require('express');
const authRoutes = express.Router();
const authHandlers = require('./auth.handlers');
const { requireLogin, requireSameUser } = require('./auth.middleware');
// Login for the first time
authRoutes.get('/login', authHandlers.login);

// Call back to 
authRoutes.get('/login-callback', authHandlers.callback);

// Check user is logged in
authRoutes.get('/check-login', requireLogin);

// Check user is the same user
authRoutes.get('/check-same-user/:id', requireSameUser);

module.exports = { authRoutes };