const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
  nickName: String,
  userName: String,
  discord_id: String,
  gamesPlayed: Number,
  gamesWon: Number,
  dateCreated: Date,
  lastUpdated: Date,
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
