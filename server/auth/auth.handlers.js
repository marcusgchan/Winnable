const axios = require('axios');
require('dotenv').config()
const userHandlers = require('../api/User/User.handlers')

// Redirect to Discord OAuth2 /api/auth/login
async function login(req, res) {
  res.redirect(process.env.REDIRECT_URI)
}

// Access token exchange
async function callback(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Something went wrong! No code found');
  }
  try {
    API_ENDPOINT = 'https://discord.com/api';
    const data = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:8080/api/auth/login-callback',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    const response = await axios.post(`${API_ENDPOINT}/oauth2/token`,
      data, 
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    );
    // Access tokens expire every 7 days
    console.log(response.data)

    const user = await axios.get(`${API_ENDPOINT}/users/@me`, {
      headers: { Authorization: `Bearer ${response.data.access_token}` }
    });

    // Check if user exists in database
    let userLogin = await userHandlers.getUserByDiscordId(user.data.id);
    if (!userLogin) {
      // Create user
      userLogin = await userHandlers.createUserByDiscordId(user.data.id, user.data.username);
      console.log('Created new user: ', newUser);
    }

    req.session.user = userLogin.discord_id;
    console.log(req.session.cookie)

    res.send('Logged in! ' + JSON.stringify(user.data));
  } catch (error) {
    console.log('ERROR IN TOKEN EXCHANGE');
    console.log(error);
    return res.status(400).send('Something went wrong!');
  }
  // Save cookie as httponly
  // use withCredentials: true
}

// Refresh token exchange
async function refresh(refresh_token) {
  try {
    API_ENDPOINT = 'https://discord.com/api/';
    
    const data = {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token,
    };

    const response = await axios.post(`${API_ENDPOINT}/oauth2/token`,
      data, 
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    );
  } catch (err) {
    console.log(err);
  }
}

async function revoke(access_token) {
  try {
    API_ENDPOINT = 'https://discord.com/api/';

    const data = {
      token: access_token,
      token_type_hint: 'access_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    const response = await axios.post(`${API_ENDPOINT}/oauth2/token/revoke`,
      data,
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    );
  } catch(err) {
    console.log(err);
  }
}


module.exports = { login, callback, refresh, revoke};