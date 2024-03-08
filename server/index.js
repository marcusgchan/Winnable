const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

let { Lobby } = require('./schemas/Lobby');
let { User } = require('./schemas/User');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example connection
mongoose
  .connect(
    `mongodb+srv://dev:mCVBv2BQAmw9ONvk@cluster0.ddzi4ur.mongodb.net/WinnableDB?retryWrites=true&w=majority&appName=Cluster0`
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

    // Test POST
    app.post('/api/user', async (req, res) => {
      try {
        let newUser = new User(req.body);
        newUser.dateCreated = Date.now();

        const savedUser = await newUser.save();

        res.json(savedUser);
      } catch (err) {
        console.error('Error creating user: ', err);
        res.status(500).json({ err: 'Failed to create user.' });
      }
    });
  });
