const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
  nickName: String,
  userName: String,
  password: String,
  gamesPlayed: Number,
  gamesWon: Number,
  dateCreated: Date,
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
