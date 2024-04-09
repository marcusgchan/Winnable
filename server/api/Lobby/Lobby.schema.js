const mongoose = require('mongoose');

// Lobby schema
const LobbySchema = new mongoose.Schema({
  lobbyName: String,
  description: String,
  maxPlayers: { type: Number, default: 10 },
  numGames: { type: Number, default: 5 }, // number of games to compete in
  dateCreated: Date,
  lastUpdated: Date,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamOne: {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  teamTwo: {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  games: [
    {
      id: Number,
      name: String,
      imageUrl: String,
      description: String,
      selectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      teamOneCompetitor: [Object],
      teamTwoCompetitor: [Object],
      winnerTeam: String,
    },
  ],
  isOpen: { type: Boolean, default: true },
  pickingPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = { Lobby };
