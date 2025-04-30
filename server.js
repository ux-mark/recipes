import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import next from 'next';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Determine environment - ensure we use production mode in DigitalOcean
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Log server startup info, useful for debugging in DigitalOcean logs
console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`Server will listen on port: ${port}`);
console.log(`Current directory: ${__dirname}`);

// Check for the existence of the .next directory
const nextDir = join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  console.error(`ERROR: Build directory ${nextDir} not found!`);
  console.log('Contents of current directory:');
  console.log(fs.readdirSync(__dirname));
} else {
  console.log(`.next directory exists at ${nextDir}`);
  console.log('Top-level .next contents:', fs.readdirSync(nextDir));
}

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Log all requests - helps with debugging
  server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Health check endpoint - useful for DigitalOcean to verify the app is running
  server.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Serve static files from the .next/static directory with caching
  server.use('/_next/static', express.static(join(__dirname, '.next/static'), {
    maxAge: '1y', // Cache static assets for a year
  }));

  // Serve files from public directory
  server.use(express.static(join(__dirname, 'public')));
  
  // Let Next.js handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  createServer(server).listen(port, (err) => {
    if (err) {
      console.error('Error starting server:', err);
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error preparing Next.js app:');
  console.error(err);
  process.exit(1);
});