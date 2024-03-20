const WebSocket = require('ws');
const { retrieveAllLobbies, retrieveLobbyById, updateLobbyById } = require('../api/Lobby/Lobby');

// { lobby1: [ { user1: "", ws: {} } ] , lobby2: { user3: ws } }
// I think this way is better cuz either way we have to get updated lobby object from the db and we can just look at who's in the lobby
// [ { userId: "", ws: {} } ]
const clients = [];

function startWebSocketServer(port) {
  const wss = new WebSocket.Server({ port });

  console.log('WebSocket server is now running on:', port);

  /* ----------------------------- Event Listeners ---------------------------- */
  wss.on('updateLobby', (ws, userId, data) => {
    updateLobby(ws, userId, data);
  });

  // sennding message to every other client connected to websocket server
  wss.on('simpleMessage', (ws, userId, data) => {
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && userId !== client.userId) {
        client.ws.send(`User ${userId} sent you a message`);
      }
    });
  });

  // on open connection, send notification to everyone
  // TODO: only send notification to everyone in the same lobby
  wss.on('onOpen', (ws, userId, data) => {
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(`User ${userId} has connected`);
      }
    });
  });

  /* --------------- Main connection and event listener routing --------------- */
  wss.on('connection', (ws) => {
    // All messages received from the clients go through here
    ws.on('message', (message) => {
      const { userId, data, event } = JSON.parse(message);

      console.log('received from client', JSON.parse(message));

      // Check which event to trigger based on the client's message
      switch (event) {
        case 'onOpen':
          clients.push({ userId, ws });
          wss.emit('onOpen', ws, userId, data);
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

    ws.on('close', function () {
      console.log('Client disconnected');
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

    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && usersInLobby.toString().includes(client.userId)) {
        client.ws.send(JSON.stringify(updatedLobby));
      }
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = startWebSocketServer;
