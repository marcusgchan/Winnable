import { useEffect, useMemo } from "react";

export function useWebSocket({
  socketUrl,
  onMessage = () => {},
  onClose = () => {},
}) {
  const ws = useMemo(() => new WebSocket(socketUrl), [socketUrl]);

  ws.onclose = () => {
    onClose();
  };

  ws.onmessage = (e) => {
    onMessage(e);
  };

  useEffect(() => {
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000);
      }
    };
  }, [ws]);

  return ws;
}
