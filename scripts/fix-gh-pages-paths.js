// This script fixes path issues in static HTML files for GitHub Pages deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../out');

// GitHub repo name - change this to match your repository name
const repoName = 'recipe-website';

// Function to recursively process HTML files
function processHtmlFiles(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      processHtmlFiles(itemPath); // Recursively process subdirectories
    } else if (itemPath.endsWith('.html')) {
      fixPaths(itemPath);
    }
  }
}

// Function to fix paths in HTML files
function fixPaths(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix paths in various asset references
  content = content.replace(/(href|src)="\/_next\//g, `$1="/${repoName}/_next/`);
  content = content.replace(/(href|src)="\//g, `$1="/${repoName}/`);
  
  // Fix paths in JSON JavaScript code (for Next.js data)
  content = content.replace(/"(\/\_next\/[^"]+)"/g, `"/${repoName}$1"`);
  content = content.replace(/"(\/images\/[^"]+)"/g, `"/${repoName}$1"`);
  
  // Ensure internal links to root are fixed
  content = content.replace(/href="\/${repoName}\/"/g, `href="/${repoName}/"`);
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

console.log(`Fixing paths in HTML files for GitHub Pages deployment...`);
processHtmlFiles(outputDir);
console.log(`Done! All HTML files have been processed for GitHub Pages compatibility.`);