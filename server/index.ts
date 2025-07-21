import 'dotenv/config';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer as createHttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { serveStaticAssets } from './vite';      // dev/prod static handling
import routes from './routes';                   // { public: Router, admin: Router }
import {
  checkIpBan,
  postRateLimiter,
  authenticateAdmin,
} from './middleware';
import { handleWsConnection } from './chat';

const PORT = parseInt(process.env.PORT || '5000', 10);
const app = express();

// —————————————————————————————————————————————
// Security & Logging
// —————————————————————————————————————————————
app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('tiny'));

// —————————————————————————————————————————————
// Middleware: Ban checks + JSON parsing
// —————————————————————————————————————————————
app.use(checkIpBan);
app.use(express.json());

// —————————————————————————————————————————————
// Rate limits for anonymous posting
// —————————————————————————————————————————————
app.use('/api/threads', postRateLimiter);           // new threads
app.use('/api/threads/:id/posts', postRateLimiter); // replies

// —————————————————————————————————————————————
// Public API routes
// —————————————————————————————————————————————
app.use('/api', routes.public);

// —————————————————————————————————————————————
// Admin API routes (JWT guard applied)
// —————————————————————————————————————————————
app.use('/api/admin', authenticateAdmin, routes.admin);

// —————————————————————————————————————————————
// Static file uploads and frontend assets
// —————————————————————————————————————————————
// Serve user-uploaded images
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Serve the Vite-built React app (or proxy in dev)
serveStaticAssets(app);

// —————————————————————————————————————————————
// WebSocket Chat (on same server)
// —————————————————————————————————————————————
const httpServer = createHttpServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
wss.on('connection', handleWsConnection);

// —————————————————————————————————————————————
// Fallback for client-side routing
// —————————————————————————————————————————————
app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// —————————————————————————————————————————————
// Global Error Handler
// —————————————————————————————————————————————
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// —————————————————————————————————————————————
// Start Server
// —————————————————————————————————————————————
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
