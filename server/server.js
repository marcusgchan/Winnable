const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes import
const { userRoutes } = require('./api/User/User.routes');

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://dev:mCVBv2BQAmw9ONvk@cluster0.ddzi4ur.mongodb.net/WinnableDB?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log(`Successfully connected to MongoDB`);

    // Routes
    app.use('/api/user', userRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
