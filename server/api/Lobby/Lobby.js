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
    return null;
  }
}

async function updateLobbyById(lobbyId, keyValueObj) {
  try {
    const updatedLobbyState = Object.fromEntries(keyValueObj.entries());
    const updatedLobby = await Lobby.findByIdAndUpdate(
      lobbyId,
      { ...updatedLobbyState, lastUpdated: Date.now() },
      { new: true }
    );
    return updatedLobby;
  } catch (err) {
    console.error('Error updateing lobby: ', err);
  }
}

// Return boolean if user can join lobby in WS
async function joinLobbyWS(lobbyId, userId) {
  // To avoid having a bunch of players join a lobby, open a socket, and not join a team,
  // In the front end we can automatically join the team with less players
  try {
    const lobby = await Lobby.findById(lobbyId);
    const isUserinLobby = lobby.teamOne.members.includes(userId) || lobby.teamTwo.members.includes(userId);
    const totalCurrentPlayers = lobby.teamOne.members.length + lobby.teamTwo.members.length;
    // User can't join if lobby is closed or full and user is not already in the lobby
    if ((!lobby.isOpen || totalCurrentPlayers >= lobby.maxPlayers) && !isUserinLobby) return false;
    return true;
  } catch (err) {
    console.error('Error joining lobby: ', err);
    return false;
  }
}

// TO DO: Kick out users form websockets if game draft started

// Idk if this will go in... but this is the function to join a lobby
async function joinLobby(lobbyId, userId) {
  try {
    const lobby = await Lobby.findById(lobbyId);
    const isUserinLobby = lobby.teamOne.members.includes(userId) || lobby.teamTwo.members.includes(userId);
    const totalCurrentPlayers = lobby.teamOne.members.length + lobby.teamTwo.members.length;
    if ((!lobby.isOpen || totalCurrentPlayers >= lobby.maxPlayers) && !isUserinLobby)
      throw new Error('Lobby is closed or full');
  } catch (err) {
    console.error('Error joining lobby: ', err);
  }
}

module.exports = {
  retrieveAllLobbies,
  retrieveLobbyById,
  updateLobbyById,
  joinLobbyWS,
  joinLobby,
};
