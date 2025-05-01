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
    } else if (itemPath.endsWith('.js')) {
      // Also fix JS files that might contain references to assets
      fixJSPaths(itemPath);
    } else if (itemPath.endsWith('.css')) {
      // Fix paths in CSS files
      fixCSSPaths(itemPath);
    }
  }
}

// Function to fix paths in HTML files
function fixPaths(filePath) {
  console.log(`Processing HTML file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix paths in various asset references
  content = content.replace(/(href|src)="\/_next\//g, `$1="/${repoName}/_next/`);
  content = content.replace(/(href|src)="\//g, `$1="/${repoName}/`);
  
  // Fix paths in JSON JavaScript code (for Next.js data)
  content = content.replace(/"(\/\_next\/[^"]+)"/g, `"/${repoName}$1"`);
  content = content.replace(/"(\/images\/[^"]+)"/g, `"/${repoName}$1"`);
  
  // Fix paths in style tags
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, `url(/${repoName}/$1$2)`);
  
  // Ensure internal links to root are fixed
  content = content.replace(/href="\/${repoName}\/"/g, `href="/${repoName}/"`);
  
  // Fix paths in JSON props that might contain URLs (React 19 / Next.js 15 specific)
  content = content.replace(/"props":({[^}]*"src":"\/[^"]*"[^}]*})/g, (match, propsGroup) => {
    return match.replace(/"src":"\/([^"]+)"/g, `"src":"/${repoName}/$1"`);
  });
  
  // Fix image JSON data structures and component props
  content = content.replace(/"images":\s*\[\s*"([^"]+)"\s*\]/g, (match, imagePath) => {
    if (imagePath.startsWith('/')) {
      return match.replace(`"${imagePath}"`, `"/${repoName}${imagePath}"`);
    } else {
      return match;
    }
  });
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

// Function to fix paths in JS files
function fixJSPaths(filePath) {
  console.log(`Processing JS file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix image and asset paths in JS files
  content = content.replace(/"\/images\/([^"]+)"/g, `"/${repoName}/images/$1"`);
  content = content.replace(/"\/(_next\/[^"]+)"/g, `"/${repoName}/$1"`);
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, `url(/${repoName}/$1$2)`);
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

// Function to fix paths in CSS files
function fixCSSPaths(filePath) {
  console.log(`Processing CSS file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix image urls in CSS
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, `url(/${repoName}/$1$2)`);
  content = content.replace(/url\(\s*['"]?\s*\/([^")]+)['"]?\s*\)/g, `url(/${repoName}/$1)`);
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

console.log(`Fixing paths in files for GitHub Pages deployment...`);
processHtmlFiles(outputDir);
console.log(`Done! All files have been processed for GitHub Pages compatibility.`);