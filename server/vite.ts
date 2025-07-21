import { Express } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const isProd = process.env.NODE_ENV === 'production';

// Mount Vite middleware or serve built files
export async function setupVite(app: Express) {
  if (!isProd) {
    // Development: use Vite's middleware (HMR, etc.)
    const vite = await createViteServer({
      server: { middlewareMode: 'html' },
      root: path.resolve(__dirname, '..', 'client'),
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    const distPath = path.resolve(__dirname, '..', 'client', 'dist');
    const indexPath = path.resolve(distPath, 'index.html');

    app.use(require('compression')());
    app.use(require('serve-static')(distPath));

    // Serve index.html for any unknown routes (SPA fallback)
    app.use('*', (req, res) => {
      res.sendFile(indexPath);
    });
  }
}
