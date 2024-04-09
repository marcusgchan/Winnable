const WebSocket = require('ws');
const url = require('url');
const util = require('util');
const { retrieveAllLobbies, retrieveLobbyById, updateLobbyById, joinLobbyWS } = require('../api/Lobby/Lobby');

// { lobby1: [ { user1: "", ws: {} } ] , lobby2: { user3: ws } }
// I think this way is better cuz either way we have to get updated lobby object from the db and we can just look at who's in the lobby
// [ { userId: "", ws: {} } ]
// The problem with this way is that a user can be in multiple lobbies. By this I mean, in the db a user can be in lobbies A and B but just be in B as a ws connection.
// Another user from A can update the lobby state have an active ws connection to A and send updates to
// lobbies = { lobbyId: [userId] }
const lobbies = new Map();
// Connections = { userId: [ {lobbyId, ws} ] }
const connections = new Map(); // Ensure users are not in multiple lobbies

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

      wss.handleUpgrade(request, socket, head, (ws, req) => {
        // Check if the user can join the lobby
        const data = url.parse(req.url, true).query;
        console.log('requested data ', data.lobby, request.session.user);
        const userId = request.session.user.id;
        const isUserAuthorized = joinLobbyWS(data.lobby, userId);
        if (isUserAuthorized) {
          wss.emit('connection', ws, request);
        } else {
          socket.write('HTTP/1.1 401 Unauthorized. Lobby is full or in game\r\n\r\n');
          socket.destroy();
        }
      });
    });
  });

  /* ----------------------------- Event Listeners ---------------------------- */
  // sennding message to every other client connected to the same lobby
  wss.on('simpleMessage', (ws, userId, data) => {
    lobbies.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && userId !== client.userId) {
        client.ws.send(`User ${userId} sent you a message`);
      }
    });
  });

  wss.on('joinTeam', (ws, user, lobbyId, data) => {
    const lobby = lobbies.get(lobbyId);
    if (data === 1) {
      const userInTeamOne = lobby.teamOne.members.some(({ id }) => id === user.id);
      if (userInTeamOne) return;
      const userIndex = lobby.teamTwo.members.findIndex(({ id }) => id === user.id);
      lobby.teamTwo.members.splice(userIndex, 1);
      lobby.teamOne.members.push(user);
    }

    if (data === 2) {
      const userInTeamTwo = lobby.teamTwo.members.some(({ id }) => id === user.id);
      if (userInTeamTwo) return;
      const userIndex = lobby.teamOne.members.findIndex(({ id }) => id === user.id);
      lobby.teamOne.members.splice(userIndex, 1);
      lobby.teamTwo.members.push(user);
    }
    console.log('jointeam', lobby.teamOne, lobby.teamTwo);

    broadcast(lobbyId);
  });

  wss.on('addGame', (ws, userId, lobbyId, data) => {
    const lobby = lobbies.get(lobbyId);
    // Check if pickingPlayerId is the same as the userId
    console.log(userId, lobby.pickingPlayerId);
    if (userId.toString() !== lobby.pickingPlayerId.toString()) return;
    if (lobby.games.length >= lobby.numGames) return;
    const totalGames = lobby.games.length + 1;
    // Team 1 always starts first so if totalGames is even, it's team 1's turn
    const team1Turn = totalGames % 2 === 0;
    console.log('ADDING GAME');
    let pickingPlayerIndex = null;
    let pickingPlayerId = null;
    // Figure out who's picking
    if (team1Turn) {
      pickingPlayerIndex = (totalGames / 2) % lobby.teamOne.members.length;
      pickingPlayerId = lobby.teamOne.members[pickingPlayerIndex].id;
      console.log('picking player id from TEAM 1:', pickingPlayerId);
    } else {
      pickingPlayerIndex = Math.floor(totalGames / 2) % lobby.teamTwo.members.length;
      pickingPlayerId = lobby.teamTwo.members[pickingPlayerIndex].id;
      console.log('picking player id from TEAM 2:', pickingPlayerId);
    }
    lobby.games.push(data);
    // Check if the game is the last game
    if (totalGames === lobby.numGames) lobby.pickingPlayerId = null;
    else lobby.pickingPlayerId = pickingPlayerId;
    // console.log('PICKING PLAYER ID', lobby.pickingPlayerId);
    broadcast(lobbyId);
    // updateLobbyById(lobbyId, lobby);
  });

  wss.on('endTeamDraft', (ws, userId, lobbyId) => {
    const lobby = lobbies.get(lobbyId);
    const lobbyHost = lobby.host.toString();
    if (userId !== lobbyHost) {
      console.log(`User ${userId} is not the host of lobby ${lobbyId} cause host is ${lobby.host}`);
      return;
    }
    lobby.isOpen = false;
    lobby.pickingPlayerId = lobby.teamOne.members[0].id;
    broadcast(lobbyId, `/${lobbyId}/draft-games`);
    console.log(
      'ending team draft, current lobby state',
      util.inspect(lobby, { showHidden: false, depth: null, colors: true })
    );

    updateLobbyById(lobbyId, lobby);
  });

  wss.on('endGameDraft', (ws, userId, lobbyId) => {
    console.log('ending game draft, current lobby state: ', lobbies.get(lobbyId));
    updateLobbyById(lobbyId, lobbies.get(lobbyId));
    broadcast(lobbyId, `/${lobbyId}/game`);
  });

  wss.on('kickPlayer', (userId, lobbyId, data) => {
    const lobby = lobbies.get(lobbyId);

    // Check if host is the one kicking the player
    if (userId !== lobby.host.toString()) return;

    const connection = connections.get(data);
    const connectionToRemove = connection.filter((con) => con.lobbyId === lobbyId);
    connectionToRemove.forEach(({ ws }) => {
      ws.close();
    });
    // updateLobbyById(lobbyId, lobby)
  });

  // This is called when lobby state needs to be updated in the game page
  // Handles update score, players competing, game winner
  // data is the entire lobby state
  wss.on('setGameState', (ws, userId, lobbyId, data) => {
    lobbies.set(lobbyId, data);

    if (data.teamOne.score + data.teamTwo.score === data.games.length) {
      if (data.teamOne.score > data.teamTwo.score) broadcast(lobbyId, 'Team One');
      if (data.teamOne.score < data.teamTwo.score) broadcast(lobbyId, 'Team Two');
      if (data.teamOne.score == data.teamTwo.score) broadcast(lobbyId, 'Tie');
      updateLobbyById(lobbyId, data);

      return;
    }
    broadcast(lobbyId);
  });

  /* --------------- Main connection and event listener routing --------------- */
  wss.on('connection', async (ws, request) => {
    // All messages received from the lobbies go through here
    const userId = request.session.user.id;
    const lobbyId = url.parse(request.url, true).query.lobby;

    // Check if user is already in a lobby, if so, close the connection
    const prevConnection = connections.get(userId);
    if (prevConnection) {
      prevConnection.push({ lobbyId, ws });
    } else {
      connections.set(userId, [{ lobbyId, ws }]);
    }

    // Check if the lobby state has been initialized
    if (!lobbies.get(lobbyId)) {
      // Fetch default lobby state
      const lobby = await retrieveLobbyById(lobbyId);
      if (!lobby) {
        ws.close();
        return;
      }

      const lobbyState = lobby.toJSON();
      lobbyState.teamOne.members.push(request.session.user);
      lobbies.set(lobbyId, lobbyState);
      console.log('new lobby', lobbyState);
    }
    // Lobby state has already been initialized
    // Add user to team with the leaset number of players or team 1 if equal
    else {
      const lobby = lobbies.get(lobbyId);
      console.log('pre connection lobby state', lobby.teamOne, lobby.teamTwo);

      if (
        !lobby.teamOne.members.find(({ id }) => id === userId) &&
        !lobby.teamTwo.members.find(({ id }) => id === userId)
      ) {
        const team1Count = lobby.teamOne.members.length;
        const team2Count = lobby.teamTwo.members.length;

        if (team1Count <= team2Count) {
          lobby.teamOne.members.push(request.session.user);
        } else {
          lobby.teamTwo.members.push(request.session.user);
        }
        lobby;
      }

      // Assign host if host is not assigned
      // Can happen if host joins then leaves and the lobby is empty
      if (lobby.host === '') {
        lobby.host = userId;
      }

      console.log('connection lobby state', lobby.teamOne, lobby.teamTwo);
    }

    broadcast(lobbyId);

    ws.on('message', (message) => {
      const { data, event } = JSON.parse(message);

      console.log('received from client', JSON.parse(message));

      // Check which event to trigger based on the client's message
      switch (event) {
        case 'simpleMessage':
          wss.emit('simpleMessage', ws, userId, data);
          break;
        case 'joinTeam':
          wss.emit('joinTeam', ws, request.session.user, lobbyId, data);
          break;
        case 'kickPlayer':
          wss.emit('kickPlayer', userId, lobbyId, data);
          break;
        case 'addGame':
          wss.emit('addGame', ws, userId, lobbyId, data);
          break;
        case 'endTeamDraft':
          wss.emit('endTeamDraft', ws, userId, lobbyId);
          break;
        case 'endGameDraft':
          wss.emit('endGameDraft', ws, userId, lobbyId);
          break;
        case 'setGameState':
          wss.emit('setGameState', ws, userId, lobbyId, data);
          break;
        default:
          console.log('Unknown event:', event);
      }
    });

    ws.on('close', (code, message) => {
      console.log('User left lobby', userId, lobbyId);
      const connection = connections.get(userId);

      if (!connection) return;

      const index = connection.findIndex((con) => con.ws === ws);
      connection.splice(index, 1);

      // Clear any broken connections
      connection.splice(connection.filter(({ ws }) => ws.readyState === WebSocket.CLOSED));

      const numOfConnectionsForCurrentLobby = connection.filter((con) => con.lobbyId === lobbyId).length;

      const lobby = lobbies.get(lobbyId);
      if (numOfConnectionsForCurrentLobby === 0) {
        const teamOneIndex = lobby.teamOne.members.findIndex(({ id }) => id === userId);
        const teamTwoIndex = lobby.teamTwo.members.findIndex(({ id }) => id === userId);
        if (teamOneIndex !== -1) {
          lobby.teamOne.members.splice(teamOneIndex, 1);
        }
        if (teamTwoIndex !== -1) {
          lobby.teamTwo.members.splice(teamTwoIndex, 1);
        }

        // Find new host if host leaves
        if (lobby.host.toString() === userId) {
          const team = Math.floor(Math.random() * 2) + 1;
          if (team === 1) {
            if (lobby.teamOne.members.length > 0) {
              lobby.host = lobby.teamOne.members[0].id;
            } else if (lobby.teamTwo.members.length > 0) {
              lobby.host = lobby.teamTwo.members[0].id;
            } else {
              lobby.host = '';
            }
          } else {
            if (lobby.teamTwo.members.length > 0) {
              lobby.host = lobby.teamTwo.members[0].id;
            } else if (lobby.teamOne.members.length > 0) {
              lobby.host = lobby.teamOne.members[0].id;
            } else {
              lobby.host = '';
            }
          }
        }
      }

      if (connection.length === 0) {
        connections.delete(userId);
      }

      broadcast(lobbyId);
    });
  });
}

function broadcast(lobbyId, redirectUrl = '') {
  const lobby = lobbies.get(lobbyId);
  const data = { lobbyState: lobby, redirectUrl };
  console.log('broadcast teamone', lobby.teamOne.members);
  console.log('broadcast teamtwo', lobby.teamTwo.members);
  lobby.teamOne.members.forEach((member) => {
    if (!connections.get(member.id)) return;
    connections.get(member.id).forEach(({ lobbyId: id, ws }) => {
      if (lobbyId === id) {
        ws.send(JSON.stringify(data));
      }
    });
  });
  lobby.teamTwo.members.forEach((member) => {
    if (!connections.get(member.id)) return;
    connections.get(member.id).forEach(({ lobbyId: id, ws }) => {
      if (lobbyId === id) {
        ws.send(JSON.stringify(data));
      }
    });
  });
}

// data is the lobby object
async function updateLobbyInDatabase(lobbyId) {
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
