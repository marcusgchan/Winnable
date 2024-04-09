let ws;
import { SERVER_URL } from "../common/constants";

// TODO: should be userId of the current logged in user
// const userId = "65e53a1b6258c473f5e22d25";
export function initializeWebSocket(lobbyId) {
  //  ws = new WebSocket(`ws://localhost:8080/?lobby=${lobbyId}`);
  ws = new WebSocket(
    `ws://${SERVER_URL.replace("https://", "")}?lobby=${lobbyId}`,
  );

  // send a message back to server once the connection has been opened
  // used to bind a userID with this websocket client
  ws.onopen = () => {
    console.log("WebSocket connection established, sending onOpen event");
    ws.send(
      JSON.stringify({
        data: `User has connected to lobby ${lobbyId}`,
        event: "onOpen",
      }),
    );
  };

  // This is where client would receive msg from the websocket server
  ws.onmessage = (event) => {
    console.log("Message from server: ", event);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

// Call this function when client leaves the lobby
export function closeWebSocket(lobbyId) {
  // Pass this to delete from memory
  const message = { lobbyId };
  if (ws) {
    ws.close(1000, JSON.stringify(message));
  }
}

// used to send the current lobby state to the websocket connection
// takes in a lobby object
export function updateLobby(userId, lobbyObj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ userId, data: lobbyObj, event: "updateLobby" }));
  } else {
    console.error("WebSocket connection not open.");
  }
}
