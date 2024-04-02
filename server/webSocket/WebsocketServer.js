const WebSocket = require('ws');
const url = require('url');
const { retrieveAllLobbies, retrieveLobbyById, updateLobbyById, joinLobbyWS } = require('../api/Lobby/Lobby');

// { lobby1: [ { user1: "", ws: {} } ] , lobby2: { user3: ws } }
// I think this way is better cuz either way we have to get updated lobby object from the db and we can just look at who's in the lobby
// [ { userId: "", ws: {} } ]
// The problem with this way is that a user can be in multiple lobbies. By this I mean, in the db a user can be in lobbies A and B but just be in B as a ws connection.
// Another user from A can update the lobby state have an active ws connection to A and send updates to 
// lobbies = { lobbyId: [userId] }
const lobbies = {};
// Connections = { userId: { lobbyId, ws } }
const connections = {}; // Ensure users are not in multiple lobbies

function deleteClosedConnections(lobbyId, indexes) {
  indexes.forEach((index) => lobbies[lobbyId].splice(index, 1));
}

// TO DO: Add MaxPayload, 

function startWebSocketServer(sessionParser, server) {
  // server.listen(port, () => {
  //   console.log('WebSocket server is now running on:', port);
  // })
  const wss = new WebSocket.Server({ clientTracking: true, noServer: true });

  /* ----------------------------- Authentication ---------------------------- */
  server.on('upgrade', (request, socket, head) => {
    console.log('Parsing session from request...');
    sessionParser(request, {}, () => {
      if (!request.session.user) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      console.log('Session is parsed!');

      wss.handleUpgrade(request, socket, head, async (ws, req) => {
        // Check if the user can join the lobby
        // const data = url.parse(req.url, true).query;
        // console.log(data.lobby, request.session.user);
        // const userId = request.session.user.id;
        // const isUserAuthorized = await joinLobbyWS(data.lobby, userId);
        // if (!isUserAuthorized) {
        //   socket.write('HTTP/1.1 401 Unauthorized. Lobby is full or in game\r\n\r\n');
        //   socket.destroy();
        //   return;
        // }
        wss.emit('connection', ws, request);
      });
    })
  });

  /* ----------------------------- Event Listeners ---------------------------- */
  wss.on('updateLobby', (ws, userId, data) => {
    updateLobby(ws, userId, data);
  });

  // sennding message to every other client connected to the same lobby
  wss.on('simpleMessage', (ws, userId, data) => {
    lobbies.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && userId !== client.userId) {
        client.ws.send(`User ${userId} sent you a message`);
      }
    });
  });

  // on open connection, send notification to everyone
  wss.on('onOpen', (ws, userId, lobbyId, data) => {
    // On connection, check what the game state is.
    // If the game is in progress, send the user to the appropriate screen.
    // Don't allow a NEW user to join a game that is already in progress.
    console.log('RUNING ON OPEN', userId, lobbyId, data);
    lobbies[lobbyId].forEach((user) => {
      console.log('ATTEMPTING sending message to user', user)
      console.log(connections)
      if (connections[user].ws.readyState === WebSocket.OPEN) {
        console.log('sending message to user', user)
        connections[user].ws.send(`User ${userId} has connected`);
      }
    });
  });

  /* --------------- Main connection and event listener routing --------------- */
  wss.on('connection', (ws, request) => {
    // All messages received from the lobbies go through here
    const userId = request.session.user.id;
    const lobbyId = url.parse(request.url, true).query.lobby;
    // Check if user is already in a lobby, if so, close the connection
    if (connections[userId]) {
      lobbies[connections[userId].lobbyId] = lobbies[connections[userId].lobbyId].filter((user) => user !== userId);
      connections[userId].ws.close();
    }
    connections[userId] = { lobbyId, ws };
    if (!lobbies[lobbyId]) lobbies[lobbyId] = [userId];
    else lobbies[lobbyId] = [ ...lobbies[lobbyId], userId];

    console.log(connections)
    console.log(lobbies)
    ws.on('message', (message) => {
      const { data, event } = JSON.parse(message);

      console.log('received from client', JSON.parse(message));

      // Check which event to trigger based on the client's message
      switch (event) {
        case 'onOpen':
          wss.emit('onOpen', ws, userId, lobbyId, data);
          break;
        case 'simpleMessage':
          wss.emit('simpleMessage', ws, userId, data);
          break;
        case 'updateLobby':
          wss.emit('updateLobby', ws, userId, data);
          break;
        default:
          console.log('Unknown event: ', event);
      }
    });

    ws.on('close', (code, message) => {
      // Delete the user websocket from memory
      // const { data } = JSON.parse(message);
      console.log('User left lobby', userId, lobbyId);
      delete connections[userId];
      lobbies[lobbyId] = lobbies[lobbyId].filter((user) => user !== userId);
      console.log(lobbies);
    });
  });
}

// data is the lobby object
async function updateLobby(ws, userId, data) {
  try {
    // 1. receive data on what to update in stringified JSON
    console.log('lobby state obj', data);
    // 2. update lobby in db and get the updated lobby object
    const updatedLobby = await updateLobbyById(data.id, data);
    // 3. find all users that are connected to that lobby and broadcast the update
    const teamOneMembers = updatedLobby.teamOne.members;
    const teamOneCaptain = updatedLobby.teamOne.captain;
    const teamTwoMembers = updatedLobby.teamTwo.members;
    const teamTwoCaptain = updatedLobby.teamTwo.captain;

    const usersInLobby = [...teamOneCaptain, ...teamOneMembers, ...teamTwoCaptain, ...teamTwoMembers];
    console.log('users in lobby', usersInLobby.toString());

    lobbies.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && usersInLobby.toString().includes(client.userId)) {
        client.ws.send(JSON.stringify(updatedLobby));
      }
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = startWebSocketServer;
