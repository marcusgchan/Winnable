const { Lobby } = require('./Lobby.schema');

async function retrieveAllLobbies() {
  console.log('retrieveAllLobbies');
  try {
    const lobbies = await Lobby.find();
    return lobbies;
  } catch (err) {
    console.error('Error finding lobbies: ', err);
  }
}

module.exports = {
  retrieveAllLobbies,
};
