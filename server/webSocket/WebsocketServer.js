const WebSocket = require('ws');
const { retrieveAllLobbies } = require('../api/Lobby/Lobby');

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

      console.log(JSON.parse(message));

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

// broadcast lobby info to all the connected user
async function updateLobby(ws, userId, data) {
  try {
    // 1. receive data on what to update in stringified JSON
    // 2. update lobby in db and get the updated lobby object
    // 3. find all users that are connected to that lobby and broadcast the update
    const lobbies = await retrieveAllLobbies();
    ws.send(JSON.stringify(lobbies));
  } catch (err) {
    console.error(err);
  }
}

module.exports = startWebSocketServer;
