const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Lobby schema
const LobbySchema = new mongoose.Schema({
  lobbyName: String,
  description: String,
  maxPlayers: Number,
  gameNumbers: Number, // number of games to compete in
  dateCreated: Date,
  team1: {
    captain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  team2: {
    captain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: Number,
  },
  games: [{ id: String, description: String, selectedBy: String, winnerTeam: String }],
});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = { Lobby };
