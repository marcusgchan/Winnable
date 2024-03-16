import uniqid from "uniqid";

let ws;
// should be userId from db, uniqid() is just a temporary test method
const userId = uniqid();

export function initializeWebSocket() {
  ws = new WebSocket("ws://localhost:8081");

  ws.onopen = () => {
    console.log("WebSocket connection established.");
    ws.send(
      JSON.stringify({
        userId,
        data: `${userId} has connected`,
        event: "onOpen",
      }),
    );
  };

  ws.onmessage = (event) => {
    console.log("Message from server", event);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

export function sendMessage(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ userId, data, event: "simpleMessage" }));
  } else {
    console.error("WebSocket connection not open.");
  }
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
  }
}

// takes in a lobby object
export function updateLobby(lobbyObj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ userId, data: lobbyObj, event: "updateLobby" }));
  } else {
    console.error("WebSocket connection not open.");
  }
}
