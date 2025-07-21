// client/src/hooks/useWebSocket.ts
import { useEffect, useRef } from "react";

type MessageHandler = (msg: any) => void;

export function useWebSocket(threadId: number | string, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = new URL(`${import.meta.env.VITE_API_URL?.replace(/^http/, 'ws') || ""}/ws`);
    url.searchParams.set("threadId", String(threadId));
    const ws = new WebSocket(url.toString());
    wsRef.current = ws;

    ws.addEventListener("message", (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        onMessage(payload);
      } catch {}
    });

    return () => {
      ws.close();
    };
  }, [threadId, onMessage]);

  return wsRef.current;
}
