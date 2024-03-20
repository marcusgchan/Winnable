const { Lobby } = require('./Lobby.schema');

async function retrieveAllLobbies() {
  try {
    const lobbies = await Lobby.find();
    return lobbies;
  } catch (err) {
    console.error('Error finding lobbies: ', err);
  }
}

async function retrieveLobbyById(lobbyId) {
  try {
    const lobby = await Lobby.findById(lobbyId);
    return lobby;
  } catch (err) {
    console.error('Error finding lobby: ', err);
  }
}

async function updateLobbyById(lobbyId, keyValueObj) {
  try {
    const updatedLobby = await Lobby.findByIdAndUpdate(
      lobbyId,
      { ...keyValueObj, lastUpdated: Date.now() },
      { new: true }
    );
    return updatedLobby;
  } catch (err) {
    console.error('Error updateing lobby: ', err);
  }
}

module.exports = {
  retrieveAllLobbies,
  retrieveLobbyById,
  updateLobbyById,
};
