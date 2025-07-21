// server/chat.ts
import { WebSocketServer } from "ws";
import type { Server as HttpServer } from "http";
import { parse } from "url";

type Client = {
  ws: WebSocket;
  threadId: string | null;
};
const clients = new Set<Client>();

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle the HTTP->WS upgrade
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "");
    if (pathname !== "/ws") return socket.destroy();

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const { query } = parse(req.url || "", true);
    const threadId = typeof query.threadId === "string" ? query.threadId : null;
    const client: Client = { ws, threadId };
    clients.add(client);

    ws.on("close", () => {
      clients.delete(client);
    });
  });

  // Broadcast helper: send `payload` to all clients on a given thread
  function broadcastToThread(threadId: string, payload: object) {
    const msg = JSON.stringify(payload);
    for (const client of clients) {
      if (client.threadId === threadId && client.ws.readyState === ws.OPEN) {
        client.ws.send(msg);
      }
    }
  }

  return { broadcastToThread };
}
