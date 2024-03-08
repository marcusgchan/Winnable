const { User } = require('./User.schema');

// POST /api/user - Create a new user
async function createUser(req, res) {
  const userObj = req.body;

  try {
    let newUser = new User(userObj);
    newUser.dateCreated = Date.now();
    newUser.lastUpdated = Date.now();

    const savedUser = await newUser.save();

    res.json(savedUser);
  } catch (err) {
    console.error('Error creating user: ', err);
    res.status(500).json({ err: 'Failed to create user.' });
  }
}

// GET /api/user - Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error finding users: ', err);
    res.status(500).json({ err: 'Failed to get users' });
  }
}

// GET /api/user/id - Get a user with given ID
async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.error('Error finding user: ', err);
    res.status(500).json({ err: 'Failed to get user' });
  }
}

// PUT /api/user/id - Update a user with given ID
async function updateUser(req, res) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updateing user: ', err);
    res.status(500).json({ err: 'Failed to update user' });
  }
}

// DELETE /api/user/id - Delete a user with given ID
async function deleteUser(req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json(deletedUser);
  } catch (err) {
    console.error('Error deleting a user: ', err);
    res.status(500).json({ err: 'Failed to delete a user' });
  }
}

module.exports = { createUser, getAllUsers, getUser, updateUser, deleteUser };
