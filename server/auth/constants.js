const MongoStore = require("connect-mongo");
require("dotenv").config();

const store = new MongoStore({
  mongoUrl: process.env.MONGODB_CONNECTION_STRING,
  ttl: 60 * 60 * 24, // prune expired entries every 24h, time in seconds
  autoremove: "native",
});

module.exports = { store };