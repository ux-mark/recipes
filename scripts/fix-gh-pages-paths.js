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
  
  // First, fix any doubled repository paths that might have been introduced
  content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
  
  // Then apply the normal fixes for paths
  content = content.replace(/(href|src)="\/_next\//g, `$1="/${repoName}/_next/`);
  
  // Be careful not to re-apply the repoName to paths that already have it
  content = content.replace(new RegExp(`(href|src)="(?!/${repoName}/)/`, 'g'), `$1="/${repoName}/`);
  
  // Fix paths in JSON JavaScript code (for Next.js data)
  content = content.replace(/"(\/\_next\/[^"]+)"/g, (match, path) => {
    if (path.indexOf(`/${repoName}/`) === -1) {
      return `"/${repoName}${path}"`;
    }
    return match;
  });
  
  content = content.replace(/"(\/images\/[^"]+)"/g, (match, path) => {
    if (path.indexOf(`/${repoName}/`) === -1) {
      return `"/${repoName}${path}"`;
    }
    return match;
  });
  
  // Fix paths in style tags
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, (match, folder, rest) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `url(/${repoName}/${folder}${rest})`;
    }
    return match;
  });
  
  // Ensure internal links to root are fixed
  content = content.replace(/href="\/${repoName}\/"/g, `href="/${repoName}/"`);
  
  // Fix paths in JSON props that might contain URLs (React 19 / Next.js 15 specific)
  content = content.replace(/"props":({[^}]*"src":"\/[^"]*"[^}]*})/g, (match, propsGroup) => {
    if (propsGroup.indexOf(`/${repoName}/`) === -1) {
      return match.replace(/"src":"\/([^"]+)"/g, `"src":"/${repoName}/$1"`);
    }
    return match;
  });
  
  // Fix image JSON data structures and component props
  content = content.replace(/"images":\s*\[\s*"([^"]+)"\s*\]/g, (match, imagePath) => {
    if (imagePath.startsWith('/') && !imagePath.startsWith(`/${repoName}/`)) {
      return match.replace(`"${imagePath}"`, `"/${repoName}${imagePath}"`);
    }
    return match;
  });
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

// Function to fix paths in JS files
function fixJSPaths(filePath) {
  console.log(`Processing JS file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // First, fix any doubled repository paths that might have been introduced
  content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
  
  // Fix image and asset paths in JS files, being careful not to double the repoName
  content = content.replace(/"\/images\/([^"]+)"/g, (match, path) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `"/${repoName}/images/${path}"`;
    }
    return match;
  });
  
  content = content.replace(/"\/(_next\/[^"]+)"/g, (match, path) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `"/${repoName}/$1"`;
    }
    return match;
  });
  
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, (match, folder, rest) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `url(/${repoName}/${folder}${rest})`;
    }
    return match;
  });
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

// Function to fix paths in CSS files
function fixCSSPaths(filePath) {
  console.log(`Processing CSS file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // First, fix any doubled repository paths that might have been introduced
  content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
  
  // Fix image urls in CSS
  content = content.replace(/url\(\s*['"]?\s*\/(images|_next)([^")]+)['"]?\s*\)/g, (match, folder, rest) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `url(/${repoName}/${folder}${rest})`;
    }
    return match;
  });
  
  content = content.replace(/url\(\s*['"]?\s*\/([^")]+)['"]?\s*\)/g, (match, path) => {
    if (match.indexOf(`/${repoName}/`) === -1) {
      return `url(/${repoName}/${path})`;
    }
    return match;
  });
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content);
}

console.log(`Fixing paths in files for GitHub Pages deployment...`);
processHtmlFiles(outputDir);
console.log(`Done! All files have been processed for GitHub Pages compatibility.`);