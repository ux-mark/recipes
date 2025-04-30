import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import next from 'next';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Serve static files from the .next/static directory
  server.use('/_next/static', express.static(join(__dirname, '.next/static'), {
    maxAge: '1y', // Cache static assets for a year
  }));

  // Let Next.js handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  createServer(server).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});