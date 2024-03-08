const express = require('express');
const userRoutes = express.Router();

const userHandlers = require('./User.handlers');

// POST /api/user - Create a new user
userRoutes.post('/', userHandlers.createUser);

// GET /api/user - Get all users
userRoutes.get('/', userHandlers.getAllUsers);

// GET /api/user/id - Get a user with given ID
userRoutes.get('/:id', userHandlers.getUser);

// PUT /api/user/id - Update a user with given ID
userRoutes.put('/:id', userHandlers.updateUser);

// DELETE /api/user/id - Delete a user with given ID
userRoutes.delete('/:id', userHandlers.deleteUser);

module.exports = { userRoutes };
