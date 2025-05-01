// This script fixes path issues in static HTML files for deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../out');

// Parse command line arguments
const args = process.argv.slice(2);
const isLocalMode = args.includes('--local');

// GitHub repo name - change this to match your repository name
const repoName = 'recipe-website';
// The base path to use in URLs - empty for local mode, repo name for GitHub Pages
const basePath = isLocalMode ? '' : `/${repoName}`;

console.log(`Running in ${isLocalMode ? 'LOCAL' : 'GITHUB PAGES'} mode`);
console.log(`Base path: "${basePath}"`);

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Skip files larger than 10MB
const BINARY_FILE_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.eot', '.jpg', '.jpeg', '.png', '.gif', '.ico', '.webp'];
const TIMEOUT = 30000; // 30 seconds timeout for file operations

// Stats
const stats = {
  processed: 0,
  errors: 0,
  skipped: 0,
  html: 0,
  js: 0,
  css: 0
};

// Function to recursively process files
function processFiles(directory) {
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      try {
        const itemPath = path.join(directory, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          processFiles(itemPath); // Recursively process subdirectories
        } else if (stats.isFile()) {
          // Skip large files
          if (stats.size > MAX_FILE_SIZE) {
            console.log(`Skipping large file: ${itemPath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
            continue;
          }
          
          // Skip binary files by extension
          const ext = path.extname(itemPath).toLowerCase();
          if (BINARY_FILE_EXTENSIONS.includes(ext)) {
            continue;
          }
          
          // Process file based on extension
          if (itemPath.endsWith('.html')) {
            fixHTMLPaths(itemPath);
          } else if (itemPath.endsWith('.js')) {
            fixJSPaths(itemPath);
          } else if (itemPath.endsWith('.css')) {
            fixCSSPaths(itemPath);
          }
        }
      } catch (err) {
        console.error(`Error processing item ${item} in ${directory}: ${err.message}`);
        stats.errors++;
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}: ${err.message}`);
    stats.errors++;
  }
}

// Helper function to safely read files with timeout
function safeReadFile(filePath) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout reading file: ${filePath}`));
    }, TIMEOUT);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      clearTimeout(timeoutId);
      resolve(content);
    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
}

// Helper function to safely write files with timeout
function safeWriteFile(filePath, content) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout writing file: ${filePath}`));
    }, TIMEOUT);
    
    try {
      fs.writeFileSync(filePath, content);
      clearTimeout(timeoutId);
      resolve();
    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
}

// Function to check if a file is binary (more thorough check)
function isBinaryFile(buffer) {
  // Check for null bytes which are common in binary files
  const nullByteCheck = buffer.includes('\0');
  if (nullByteCheck) return true;
  
  // Check for high concentration of non-printable characters
  let nonPrintable = 0;
  const sampleSize = Math.min(buffer.length, 1000); // Check first 1000 chars
  
  for (let i = 0; i < sampleSize; i++) {
    const code = buffer.charCodeAt(i);
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127) {
      nonPrintable++;
    }
  }
  
  // If more than 10% are non-printable, consider it binary
  return nonPrintable > sampleSize * 0.1;
}

// Helper to ensure a path has the correct base path
function ensureCorrectPath(path) {
  // If we're in local mode, don't add the base path
  if (isLocalMode) {
    // Remove any repository prefixes that might exist
    return path.replace(new RegExp(`^/${repoName}/`, 'g'), '/');
  } else {
    // Add the repository name for GitHub Pages
    if (path.startsWith('/')) {
      // Don't double up on slashes or add prefix to protocol-relative URLs
      if (path.startsWith('//')) {
        return path;
      }
      
      // Don't add the prefix if it already exists
      if (path.startsWith(`/${repoName}/`)) {
        return path;
      }
      
      // Add the prefix
      return `/${repoName}${path}`;
    }
    
    // If path doesn't start with slash, still add proper prefix
    return `/${repoName}/${path}`;
  }
}

// Function to fix paths in HTML files
async function fixHTMLPaths(filePath) {
  try {
    console.log(`Processing HTML file: ${filePath}`);
    
    // Read file content with timeout
    let content;
    try {
      content = await safeReadFile(filePath);
    } catch (err) {
      console.error(`Error reading file ${filePath}: ${err.message}`);
      stats.skipped++;
      return;
    }
    
    // Skip if binary
    if (isBinaryFile(content)) {
      console.log(`Skipping binary file: ${filePath}`);
      stats.skipped++;
      return;
    }
    
    // Get original size for comparison
    const originalSize = content.length;
    
    // Fix any doubled repository paths that might have been introduced
    if (!isLocalMode) {
      content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
    } else {
      // In local mode, remove any repo prefixes
      content = content.replace(new RegExp(`/${repoName}/`, 'g'), '/');
    }
    
    // Fix Next.js asset paths specifically - critical for proper loading of CSS and JS
    content = content.replace(/(href|src)=["'](\/_next\/[^"']+)["']/g, (match, attr, path) => {
      return `${attr}="${ensureCorrectPath(path)}"`;
    });
    
    // Fix unprocessed Markdown image syntax that appears directly in HTML
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imgPath) => {
      // Get the current path context
      const pathSegments = filePath.split('/');
      const currentDir = pathSegments[pathSegments.length - 2];
      
      // Determine the correct image path
      let correctImagePath;
      if (imgPath.includes('/')) {
        // Path with directory structure
        correctImagePath = ensureCorrectPath(`/images/${imgPath}`);
      } else {
        // Likely a direct reference to an image in the same folder
        correctImagePath = ensureCorrectPath(`/images/${currentDir}/${imgPath}`);
      }
      
      return `<img src="${correctImagePath}" alt="${altText}">`;
    });
    
    // Fix paths in link and script tags with absolute paths
    content = content.replace(/(<link[^>]*href=["']|<script[^>]*src=["']|<img[^>]*src=["']|<a[^>]*href=["'])(\/[^"'>]+)(["'][^>]*>)/g, 
      (match, prefix, path, suffix) => {
        // Don't modify paths that already have the repo name or are protocol-relative
        if (path.startsWith(`/${repoName}/`) || path.startsWith('//')) {
          return match;
        }
        return `${prefix}${ensureCorrectPath(path)}${suffix}`;
    });
    
    // Fix paths in JSON props serialized in script tags
    content = content.replace(/"props":{([^}]*)"(\/[^"]+)"([^}]*)}/g, (match, before, path, after) => {
      if (!path.startsWith(`/${repoName}/`) && !path.startsWith('//')) {
        return `"props":{${before}"${ensureCorrectPath(path)}"${after}}`;
      }
      return match;
    });
    
    // Fix paths in style tags and inline CSS
    content = content.replace(/url\(\s*(['"]?)\s*\/(.*?)(['"]?)\s*\)/g, (match, q1, path, q2) => {
      if (!path.startsWith(`${repoName}/`) && !path.startsWith('//')) {
        return `url(${q1}${ensureCorrectPath('/' + path)}${q2})`;
      }
      return match;
    });
    
    // Write back only if changes were made
    if (content.length !== originalSize || content !== await safeReadFile(filePath)) {
      await safeWriteFile(filePath, content);
      stats.html++;
      stats.processed++;
    }
  } catch (err) {
    console.error(`Error fixing HTML paths in ${filePath}: ${err.message}`);
    stats.errors++;
  }
}

// Function to fix paths in JS files
async function fixJSPaths(filePath) {
  try {
    console.log(`Processing JS file: ${filePath}`);
    
    // Read file content
    let content;
    try {
      content = await safeReadFile(filePath);
    } catch (err) {
      console.error(`Error reading file ${filePath}: ${err.message}`);
      stats.skipped++;
      return;
    }
    
    // Skip if binary
    if (isBinaryFile(content)) {
      console.log(`Skipping binary file: ${filePath}`);
      stats.skipped++;
      return;
    }
    
    const originalSize = content.length;
    
    // Fix doubled repository paths or remove repo prefix in local mode
    if (!isLocalMode) {
      content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
    } else {
      content = content.replace(new RegExp(`/${repoName}/`, 'g'), '/');
    }
    
    // Fix Next.js runtime paths in JavaScript
    content = content.replace(/path:"(\/_next\/[^"]+)"/g, (match, nextPath) => {
      return `path:"${ensureCorrectPath(nextPath)}"`;
    });
    
    // Fix Next.js asset paths in JavaScript
    content = content.replace(/"(\/_next\/static\/[^"]+)"/g, (match, path) => {
      return `"${ensureCorrectPath(path)}"`;
    });
    
    // Fix simple path patterns in JS
    content = content.replace(/"\/images\/(.*?)"/g, (match, path) => {
      return `"${ensureCorrectPath('/images/' + path)}"`;
    });
    
    // Fix paths in string literals with template strings or string concatenation
    content = content.replace(/(['"`])(\/[^'"`\s]+)(['"`])/g, (match, openQuote, path, closeQuote) => {
      if (!path.startsWith(`/${repoName}/`) && !path.startsWith('//')) {
        return `${openQuote}${ensureCorrectPath(path)}${closeQuote}`;
      }
      return match;
    });
    
    // Fix paths in url() functions in JS
    content = content.replace(/url\(\s*['"]?\s*\/(.*?)['"]?\s*\)/g, (match, path) => {
      if (!path.startsWith(`${repoName}/`) && !path.startsWith('//')) {
        return `url(${ensureCorrectPath('/' + path)})`;
      }
      return match;
    });
    
    // Write back only if changes were made
    if (content.length !== originalSize || content !== await safeReadFile(filePath)) {
      await safeWriteFile(filePath, content);
      stats.js++;
      stats.processed++;
    }
  } catch (err) {
    console.error(`Error fixing JS paths in ${filePath}: ${err.message}`);
    stats.errors++;
  }
}

// Function to fix paths in CSS files
async function fixCSSPaths(filePath) {
  try {
    console.log(`Processing CSS file: ${filePath}`);
    
    // Read file content
    let content;
    try {
      content = await safeReadFile(filePath);
    } catch (err) {
      console.error(`Error reading file ${filePath}: ${err.message}`);
      stats.skipped++;
      return;
    }
    
    // Skip if binary
    if (isBinaryFile(content)) {
      console.log(`Skipping binary file: ${filePath}`);
      stats.skipped++;
      return;
    }
    
    const originalSize = content.length;
    
    // Fix doubled repository paths or remove repo prefix in local mode
    if (!isLocalMode) {
      content = content.replace(new RegExp(`/${repoName}/${repoName}/`, 'g'), `/${repoName}/`);
    } else {
      content = content.replace(new RegExp(`/${repoName}/`, 'g'), '/');
    }
    
    // Fix all url() references in CSS, handling various formats
    content = content.replace(/url\(\s*(['"]?)\s*([^)'"]+)(['"]?)\s*\)/g, (match, q1, path, q2) => {
      // Skip data URLs and absolute URLs
      if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('//')) {
        return match;
      }
      
      // Handle paths that start with / (absolute paths)
      if (path.startsWith('/')) {
        if (!path.startsWith(`/${repoName}/`)) {
          return `url(${q1}${ensureCorrectPath(path)}${q2})`;
        }
        return match;
      }
      
      // Handle relative paths - we need to maintain their relativity
      // but ensure they're not incorrectly prefixed
      return match;
    });
    
    // Write back only if changes were made
    if (content.length !== originalSize || content !== await safeReadFile(filePath)) {
      await safeWriteFile(filePath, content);
      stats.css++;
      stats.processed++;
    }
  } catch (err) {
    console.error(`Error fixing CSS paths in ${filePath}: ${err.message}`);
    stats.errors++;
  }
}

// Special handling for recipe pages
async function processRecipePages() {
  const recipesDir = path.join(outputDir, 'recipes');
  
  if (fs.existsSync(recipesDir)) {
    try {
      const items = fs.readdirSync(recipesDir);
      
      for (const item of items) {
        const itemPath = path.join(recipesDir, item);
        
        if (fs.statSync(itemPath).isDirectory()) {
          const indexPath = path.join(itemPath, 'index.html');
          
          if (fs.existsSync(indexPath)) {
            try {
              console.log(`Processing recipe page: ${indexPath}`);
              const content = await safeReadFile(indexPath);
              
              // Fix recipe-specific Markdown image syntax
              let newContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imgPath) => {
                // Convert to HTML img tag with proper path
                if (!imgPath.startsWith('http')) {
                  return `<img src="${ensureCorrectPath(`/images/${item}/${imgPath}`)}" alt="${altText}">`;
                }
                return match;
              });
              
              // Fix any unprocessed markdown paragraphs that might contain images
              const markdownImagePattern = /<p[^>]*>!\[([^\]]*)\]\(([^)]+)\)<\/p>/g;
              newContent = newContent.replace(markdownImagePattern, (match, altText, imgPath) => {
                return `<p><img src="${ensureCorrectPath(`/images/${item}/${imgPath}`)}" alt="${altText}"></p>`;
              });
              
              if (content !== newContent) {
                await safeWriteFile(indexPath, newContent);
                stats.processed++;
                console.log(`Fixed recipe-specific issues in ${item}`);
              }
            } catch (err) {
              console.error(`Error processing recipe page ${indexPath}: ${err.message}`);
              stats.errors++;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error accessing recipes directory: ${err.message}`);
    }
  }
}

// Main execution
console.log(`Starting path fixing for deployment...`);
console.log(`Output directory: ${outputDir}`);

const startTime = Date.now();

try {
  // Process all files
  processFiles(outputDir);
  
  // Special case processing for recipe pages
  processRecipePages();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`
=== Path Fixing Complete ===
Mode: ${isLocalMode ? 'LOCAL' : 'GITHUB PAGES'}
Duration: ${duration} seconds
Files processed: ${stats.processed}
HTML files: ${stats.html}
JS files: ${stats.js}
CSS files: ${stats.css}
Skipped files: ${stats.skipped}
Errors: ${stats.errors}
=======================================
  `);
} catch (err) {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
}