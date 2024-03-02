const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

let { Lobby } = require('./Schemas/Lobby');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example connection
mongoose
  .connect(
    `mongodb+srv://kyletseng1699:kiNkRYZ426AWSVNc@cluster0.ddzi4ur.mongodb.net/WinnableDB?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log(`Successfully connected to MongoDB`);

    // Test POST
    app.post('/api/lobby', async (req, res) => {
      try {
        let newLobby = new Lobby(req.body);
        newLobby.dateCreated = Date.now();

        const savedLobby = await newLobby.save();

        res.json(savedLobby);
      } catch (err) {
        console.error('Error creating lobby: ', err);
        res.status(500).json({ err: 'Failed to create lobby.' });
      }
    });
  });
