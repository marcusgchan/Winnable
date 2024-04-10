const axios = require("axios");
require("dotenv").config();
const userHandlers = require("../api/User/User.handlers");

// Redirect to Discord OAuth2 /api/auth/login
async function login(req, res) {
  console.log(process.env.REDIRECT_URI);
  res.redirect(process.env.REDIRECT_URI);
}

async function loginTest(req, res) {
  const id = crypto.randomUUID();
  const username = "testuser" + id;
  req.session.user = { id: "66135c4e5e31aaefbe08130c", username: "TestUser1" };
  res.redirect(process.env.FRONTEND_URL);
}

// Access token exchange
async function callback(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Something went wrong! No code found");
  }
  try {
    API_ENDPOINT = "https://discord.com/api";
    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: `http://${process.env.SERVER_URL}/api/auth/login-callback`,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    let response;
    try {
      // response = await axios.post(`${API_ENDPOINT}/oauth2/token`, data, {
      //   headers: { "content-type": "application/x-www-form-urlencoded" },
      // });
      response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data),
      });
      response = await response.json();
    } catch (error) {
      console.log("Error in token");
      console.log(await error.res);
      return res.status(400).send("Something went wrong!");
    }
    console.log("res", response);
    // Access tokens expire every 7 days, then it will ask for re-authorization
    let user;
    try {
      user = await axios.get(`${API_ENDPOINT}/users/@me`, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
    } catch (error) {
      console.log("Error in me");
      console.log(error);
    }

    // Check if user exists in database
    let userLogin;
    try {
      userLogin = await userHandlers.getUserByDiscordId(user.id);
      console.log("user login first", user.data);
      if (!userLogin) {
        // Create user
        userLogin = await userHandlers.createUserByDiscordId(
          user.id,
          user.username,
        );
      }
    } catch (error) {
      console.log("Error in user");
      console.log(error);
    }

    console.log("userLogin", userLogin._id.toString());
    req.session.user = {
      id: userLogin._id.toString(),
      username: user.data.username,
    };

    console.log("callback req.session.user", req.session);

    console.log("frontend url", process.env.FRONTEND_URL);
    return res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.log("ERROR IN TOKEN EXCHANGE");
    console.log(error);
    return res.status(400).send("Something went wrong!");
  }
  // Save cookie as httponly
  // use withCredentials: true
}

// Refresh token exchange
async function refresh(refresh_token) {
  try {
    API_ENDPOINT = "https://discord.com/api/";

    const data = {
      grant_type: "refresh_token",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token,
    };

    const response = await axios.post(`${API_ENDPOINT}/oauth2/token`, data, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  } catch (err) {
    console.log(err);
  }
}

async function revoke(access_token) {
  try {
    API_ENDPOINT = "https://discord.com/api/";

    const data = {
      token: access_token,
      token_type_hint: "access_token",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };

    const response = await axios.post(
      `${API_ENDPOINT}/oauth2/token/revoke`,
      data,
      {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
    );
  } catch (err) {
    console.log(err);
  }
}

async function authorize(req, res) {
  console.log("authorize", req.session);
  if (!req.session.user) {
    return res.json({ user: null, error: "Not logged in" });
  }
  res.json({ user: req.session.user });
}

async function logout(req, res) {
  req.session.destroy();
  res.json({ user: null });
}

module.exports = {
  login,
  loginTest,
  callback,
  refresh,
  revoke,
  authorize,
  logout,
};
