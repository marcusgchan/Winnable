const mongoose = require('mongoose');

// Lobby schema
const LobbySchema = new mongoose.Schema({
  lobbyName: String,
  description: String,
  maxPlayers: Number,
  gameNumbers: Number, // number of games to compete in
  dateCreated: Date,
  lastUpdated: Date,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamOne: {
    captain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  teamTwo: {
    captain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  games: [
    {
      id: String,
      name: String,
      imageUrl: String,
      description: String,
      selectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      winnerTeam: String,
    },
  ],
});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = { Lobby };
