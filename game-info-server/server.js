const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const REQUEST_HEADERS = {
  Authorization: process.env.AUTHORIZATION,
  'Client-ID': process.env.CLIENT_ID,
};

const IGDB_URL = process.env.IGDB_URL;

// Given a string, search a list of games where the name contains that string
app.post('/game-list', async (req, res) => {
  const { searchString } = req.body;

  try {
    const result = await getGameList(searchString);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Failed to search' });
  }
});

// Get id, cover id, and name with the given searchstring
async function getGameList(searchString) {
  try {
    const response = await axios.post(`${IGDB_URL}/games`, `fields name, cover; search "${searchString}";`, {
      headers: REQUEST_HEADERS,
    });
    if (response.status === 200) {
      const gameResultPromises = response.data.map(async (game) => {
        let coverUrl;
        // if game coverID exists, search for URL
        if (game.cover) {
          coverUrl = await getCover(game.cover);
        }
        return {
          ...game,
          cover: coverUrl,
        };
      });

      let gameResult = await Promise.all(gameResultPromises);
      return gameResult;
    }
  } catch (err) {
    console.error(err);
  }
}

// Get full image url with given cover id
async function getCover(coverId) {
  try {
    const response = await axios.post(`${IGDB_URL}/covers`, `fields *; where id = ${coverId};`, {
      headers: REQUEST_HEADERS,
    });
    if (response.status === 200 && response.data[0].url) {
      return response.data[0].url.replace('//', '').replace('t_thumb', 't_1080p');
    }
  } catch (err) {
    console.error(err);
  }
}

app.listen(process.env.PORT, () => {
  console.log('Game list server is running on port ', process.env.PORT);
});
