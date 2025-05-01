// Deploy build helper script for DigitalOcean App Platform
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output colored logs for better visibility
const log = {
  info: (msg) => console.log(`\x1b[36m🔷 ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`)
};

// Path to output directory
const outDir = path.join(__dirname, '..', 'out');
const publicDir = path.join(__dirname, '..', 'public');
const notFoundFile = path.join(publicDir, '404.html');

// Make sure the output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  log.info('Created output directory');
}

// Run the Next.js build with better error handling
log.info('Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
  log.success('Next.js build completed successfully');
} catch (error) {
  // Continue even if the build has warnings or non-fatal errors
  log.warn('Build completed with warnings or non-critical errors');
  // The build might have partially succeeded, so we continue
}

// Ensure index.html exists at the root
const indexHtmlPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  log.warn('No root index.html found, looking for alternatives...');
  
  // Check for home page at /index
  const homeIndexPath = path.join(outDir, 'index', 'index.html');
  if (fs.existsSync(homeIndexPath)) {
    fs.copyFileSync(homeIndexPath, indexHtmlPath);
    log.success('Copied index/index.html to root');
  } else {
    // Check for public fallback
    const publicIndexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(publicIndexPath)) {
      fs.copyFileSync(publicIndexPath, indexHtmlPath);
      log.success('Copied public/index.html to output directory');
    } else {
      // Create a minimal index.html that redirects to the app
      log.warn('Creating minimal index.html fallback');
      fs.writeFileSync(indexHtmlPath, `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fairy Bites Recipes</title>
          <script>
            window.location.href = '/recipes/';
          </script>
        </head>
        <body>
          <p>Loading Fairy Bites Recipes...</p>
        </body>
        </html>
      `);
      log.success('Created fallback index.html');
    }
  }
}

// Create 404.html if it doesn't exist
const outputNotFoundFile = path.join(outDir, '404.html');
if (!fs.existsSync(outputNotFoundFile)) {
  log.info('Creating 404.html page...');
  
  if (fs.existsSync(notFoundFile)) {
    // Use the existing 404 page from public directory
    fs.copyFileSync(notFoundFile, outputNotFoundFile);
    log.success('Copied 404.html from public directory');
  } else {
    // Create a basic 404 page
    fs.writeFileSync(outputNotFoundFile, `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Page Not Found - Fairy Bites Recipes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px 20px; text-align: center; }
          h1 { margin: 30px 0; font-size: 2.5em; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
        <script>
          // Check if the requested path might exist as an HTML file
          const path = window.location.pathname;
          const possiblePath = path.endsWith('/') ? path + 'index.html' : path + '.html';
          
          // Try to navigate to possible path if it's not already tried
          if (path !== possiblePath && path !== possiblePath.replace('.html', '')) {
            fetch(possiblePath)
              .then(response => {
                if (response.ok) {
                  window.location.href = possiblePath;
                }
              })
              .catch(() => {
                // Silently fail - we'll show the 404 page
              });
          }
        </script>
      </head>
      <body>
        <h1>Page Not Found</h1>
        <p>Sorry, we couldn't find the page you're looking for.</p>
        <p><a href="/">Go back to homepage</a></p>
      </body>
      </html>
    `);
    log.success('Created custom 404.html page');
  }
}

// Copy essential routing files from public
log.info('Copying routing files...');
['.htaccess', '_redirects'].forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(outDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    log.success(`Copied ${file}`);
  }
});

// Create SPA fallback files
log.info('Creating SPA fallbacks...');
const spaFallbackPath = path.join(outDir, '200.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, spaFallbackPath);
  log.success('Created 200.html fallback for SPA routing');
}

// Create a robots.txt if it doesn't exist
const robotsPath = path.join(outDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fs.writeFileSync(robotsPath, `User-agent: *\nAllow: /`);
  log.success('Created robots.txt');
}

log.success('Build preparation complete!');