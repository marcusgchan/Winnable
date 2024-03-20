const { Lobby } = require('./Lobby.schema');
const { retrieveAllLobbies, retrieveLobbyById, updateLobbyById } = require('./Lobby');

// POST /api/lobby - Create a new lobby
async function createLobby(req, res) {
  try {
    let newLobby = new Lobby(req.body);
    newLobby.dateCreated = Date.now();
    newLobby.lastUpdated = Date.now();

    const savedLobby = await newLobby.save();

    res.json(savedLobby);
  } catch (err) {
    console.error('Error creating lobby: ', err);
    res.status(500).json({ err: 'Failed to create lobby.' });
  }
}

// GET /api/lobby - Get all lobbies
async function getAllLobbies(req, res) {
  try {
    const lobbies = await retrieveAllLobbies();
    res.json(lobbies);
  } catch (err) {
    console.error('Error finding lobbies: ', err);
    res.status(500).json({ err: 'Failed to get lobbies' });
  }
}

// GET /api/lobby/id - Get a lobby with given ID
async function getLobby(req, res) {
  try {
    const lobby = await retrieveLobbyById(req.params.id);
    res.json(lobby);
  } catch (err) {
    console.error('Error finding lobby: ', err);
    res.status(500).json({ err: 'Failed to get lobby' });
  }
}

// PUT /api/lobby/id - Update a lobby with given ID
async function updateLobby(req, res) {
  try {
    const updatedLobby = await updateLobbyById(req.params.id, req.body);
    res.json(updatedLobby);
  } catch (err) {
    console.error('Error updateing lobby: ', err);
    res.status(500).json({ err: 'Failed to update lobby' });
  }
}

// DELETE /api/lobby/id - Delete a lobby with given ID
async function deleteLobby(req, res) {
  try {
    const deletedLobby = await Lobby.findByIdAndDelete(req.params.id);
    res.json(deletedLobby);
  } catch (err) {
    console.error('Error deleting a lobby: ', err);
    res.status(500).json({ err: 'Failed to delete a lobby' });
  }
}

module.exports = {
  createLobby,
  getAllLobbies,
  getLobby,
  updateLobby,
  deleteLobby,
};
