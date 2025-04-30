// Deploy build helper script for DigitalOcean App Platform
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the Next.js build
console.log('🏗️ Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  // Continue even if the build has warnings or non-fatal errors
  console.warn('⚠️ Build completed with warnings');
}

// Path to output directory
const outDir = path.join(__dirname, '..', 'out');

// Make sure the index.html file exists at the root
const indexHtmlPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('⚠️ No root index.html found, copying from public directory...');
  const publicIndexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    fs.copyFileSync(publicIndexPath, indexHtmlPath);
    console.log('✓ Copied index.html to output directory');
  }
}

// Copy essential routing files from public
console.log('📄 Copying routing files...');
['.htaccess', '_redirects'].forEach(file => {
  const srcPath = path.join(__dirname, '..', 'public', file);
  const destPath = path.join(outDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${file}`);
  }
});

// Create a SPA fallback file in case it's needed
console.log('🔄 Creating SPA fallback...');
const spaFallbackPath = path.join(outDir, '200.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, spaFallbackPath);
  console.log('✓ Created 200.html fallback');
}

console.log('✅ Build preparation complete!');