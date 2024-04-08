const axios = require("axios");
require("dotenv").config();

const GAME_API_URL = process.env.GAME_API_URL;

// GET /search-games/:searchString
async function searchGames(req, res) {
  try {
    console.log("Searching for games:", req.params.searchString);
    const data = { searchString: req.params.searchString };
    const response = await axios.post(`${GAME_API_URL}/game-list`, data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Response from game api: ", response);
    res.json(response.data);
  } catch (err) {
    console.error("Error finding games: ", err);
    res.status(500).json({ err: "Failed to get games" });
  }
}

module.exports = {
  searchGames,
};