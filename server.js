import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import next from 'next';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Print environment for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PWD: process.cwd(),
  DIRNAME: __dirname
});

// List the files in the current directory for debugging
try {
  console.log('Files in current directory:', fs.readdirSync(process.cwd()));
  if (fs.existsSync(join(process.cwd(), '.next'))) {
    console.log('Files in .next directory:', fs.readdirSync(join(process.cwd(), '.next')));
  } else {
    console.log('.next directory not found in current working directory');
  }
} catch (err) {
  console.error('Error listing files:', err);
}

// Determine environment - ensure we use production mode in DigitalOcean
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Log server startup info, useful for debugging in DigitalOcean logs
console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`Server will listen on port: ${port}`);

try {
  // Create Next.js app instance with explicit paths
  const app = next({ 
    dev, 
    hostname, 
    port,
    dir: process.cwd(), // Use process.cwd() instead of __dirname to ensure correct path in containers
    conf: {
      distDir: '.next',
      outDir: '.next/standalone'
    }
  });
  
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const server = express();
    
    // Log all requests - helps with debugging
    server.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // Health check endpoint - useful for DigitalOcean to verify the app is running
    server.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown'
      });
    });
    
    // Debug endpoint
    server.get('/_debug', (req, res) => {
      const debug = {
        env: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT
        },
        cwd: process.cwd(),
        dirname: __dirname,
        hostname: hostname,
        port: port
      };
      res.status(200).json(debug);
    });
    
    // Serve static files from the .next/static directory with caching
    const staticPath = join(process.cwd(), '.next', 'static');
    if (fs.existsSync(staticPath)) {
      console.log(`Static path ${staticPath} exists, setting up static serving`);
      server.use('/_next/static', express.static(staticPath, {
        maxAge: '1y', // Cache static assets for a year
      }));
    } else {
      console.error(`Static path ${staticPath} does not exist!`);
    }

    // Serve files from public directory but avoid serving index.html directly
    const publicPath = join(process.cwd(), 'public');
    if (fs.existsSync(publicPath)) {
      console.log(`Public path ${publicPath} exists, setting up static file serving`);
      server.use(express.static(publicPath, {
        index: false // Don't serve index.html automatically
      }));
    } else {
      console.error(`Public path ${publicPath} does not exist!`);
    }
    
    // Let Next.js handle all other requests
    server.all('*', (req, res) => {
      try {
        console.log(`Handling request: ${req.method} ${req.url}`);
        return handle(req, res);
      } catch (err) {
        console.error(`Error handling request ${req.url}:`, err);
        res.status(500).send('Internal Server Error');
      }
    });

    createServer(server).listen(port, (err) => {
      if (err) {
        console.error('Error starting server:', err);
        throw err;
      }
      console.log(`> Server started successfully on port ${port}`);
    });
  }).catch(err => {
    console.error('Error preparing Next.js app:');
    console.error(err);
    process.exit(1);
  });
} catch (err) {
  console.error('Uncaught error during server initialization:');
  console.error(err);
  process.exit(1);
}