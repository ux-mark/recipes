// This script fixes path issues in static HTML files for GitHub Pages deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../out');

// Parse command line arguments
const args = process.argv.slice(2);
const isDebugMode = args.includes('--debug');

// GitHub repo name - change this to match your repository name
const repoName = 'recipes';
const basePath = `/${repoName}`;

console.log(`Running GitHub Pages path fixer${isDebugMode ? ' (DEBUG MODE)' : ''}`);
console.log(`Base path: "${basePath}"`);

// Stats tracking
let filesProcessed = 0;
let pathsFixed = 0;

// Process HTML files to fix asset paths
function processHtmlFiles(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // Recursively process directories
      processHtmlFiles(fullPath);
    } else if (item.name.endsWith('.html')) {
      try {
        // Process HTML file
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Create modified content with fixed paths
        let newContent = content;
        
        // Fix image paths
        newContent = newContent.replace(
          /(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, src, suffix) => {
            // Skip already fixed paths or external URLs
            if (src.includes(basePath) || src.startsWith('http')) {
              return match;
            }
            
            // Add basePath for absolute paths
            let fixedSrc = src;
            if (src.startsWith('/')) {
              fixedSrc = `${basePath}${src}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed img src: ${src} -> ${fixedSrc}`);
            }
            
            return `${prefix}${fixedSrc}${suffix}`;
          }
        );
        
        // Fix CSS and JS references
        newContent = newContent.replace(
          /(<link[^>]+href=["'])([^"']+)(["'][^>]*>)|(<script[^>]+src=["'])([^"']+)(["'][^>]*>)/g,
          (match, linkPrefix, linkHref, linkSuffix, scriptPrefix, scriptSrc, scriptSuffix) => {
            if (linkPrefix && linkHref) {
              // Fix CSS link
              if (linkHref.startsWith('http') || linkHref.includes(basePath)) {
                return match;
              }
              
              let fixedHref = linkHref;
              if (linkHref.startsWith('/')) {
                fixedHref = `${basePath}${linkHref}`;
                pathsFixed++;
                if (isDebugMode) console.log(`Fixed link href: ${linkHref} -> ${fixedHref}`);
              }
              
              return `${linkPrefix}${fixedHref}${linkSuffix}`;
            } else if (scriptPrefix && scriptSrc) {
              // Fix script src
              if (scriptSrc.startsWith('http') || scriptSrc.includes(basePath)) {
                return match;
              }
              
              let fixedSrc = scriptSrc;
              if (scriptSrc.startsWith('/')) {
                fixedSrc = `${basePath}${scriptSrc}`;
                pathsFixed++;
                if (isDebugMode) console.log(`Fixed script src: ${scriptSrc} -> ${fixedSrc}`);
              }
              
              return `${scriptPrefix}${fixedSrc}${scriptSuffix}`;
            }
            
            return match;
          }
        );
        
        // Fix any other paths in data attributes
        newContent = newContent.replace(
          /(data-[a-z-]+=["'])([^"']+)(["'])/g,
          (match, prefix, value, suffix) => {
            if (value.startsWith('http') || !value.includes('/') || value.includes(basePath)) {
              return match;
            }
            
            let fixedValue = value;
            if (value.startsWith('/')) {
              fixedValue = `${basePath}${value}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed data attribute: ${value} -> ${fixedValue}`);
            }
            
            return `${prefix}${fixedValue}${suffix}`;
          }
        );
        
        // Fix background images in inline styles
        newContent = newContent.replace(
          /(style=["'][^"']*background-image:\s*url\(\s*['"]?)([^'")\s]+)(['"]?\s*\)[^"']*["'])/g,
          (match, prefix, url, suffix) => {
            if (url.startsWith('http') || url.startsWith('data:') || url.includes(basePath)) {
              return match;
            }
            
            let fixedUrl = url;
            if (url.startsWith('/')) {
              fixedUrl = `${basePath}${url}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed background-image: ${url} -> ${fixedUrl}`);
            }
            
            return `${prefix}${fixedUrl}${suffix}`;
          }
        );
        
        // Fix SVG image references
        newContent = newContent.replace(
          /(<use[^>]+href=["'])([^"']+)(["'][^>]*>)/g,
          (match, prefix, href, suffix) => {
            if (href.startsWith('http') || href.startsWith('#') || href.includes(basePath)) {
              return match;
            }
            
            let fixedHref = href;
            if (href.startsWith('/')) {
              fixedHref = `${basePath}${href}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed SVG use href: ${href} -> ${fixedHref}`);
            }
            
            return `${prefix}${fixedHref}${suffix}`;
          }
        );
        
        // Update file if changes were made
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          filesProcessed++;
          console.log(`Updated: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  }
}

// Fix image paths in JS files
function processJsFiles(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // Recursively process directories
      processJsFiles(fullPath);
    } else if (item.name.endsWith('.js')) {
      try {
        // Process JS file
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Fix paths in string literals
        let newContent = content.replace(
          /(["'])(\/_next\/[^"']+|\/images\/[^"']+|\/[^"']+\.(svg|png|jpg|jpeg|gif))(["'])/g,
          (match, prefix, path, suffix) => {
            if (path.includes(basePath)) {
              return match;
            }
            
            const fixedPath = `${basePath}${path}`;
            pathsFixed++;
            if (isDebugMode) console.log(`Fixed JS path: ${path} -> ${fixedPath}`);
            
            return `${prefix}${fixedPath}${suffix}`;
          }
        );
        
        // Update file if changes were made
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          filesProcessed++;
          console.log(`Updated JS: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  }
}

// Fix CSS url() paths
function processCssFiles(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // Recursively process directories
      processCssFiles(fullPath);
    } else if (item.name.endsWith('.css')) {
      try {
        // Process CSS file
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Fix url() paths
        let newContent = content.replace(
          /url\(\s*(['"]?)([^'")]+)(['"]?)\s*\)/g,
          (match, prefix, url, suffix) => {
            if (url.startsWith('http') || url.startsWith('data:') || url.includes(basePath)) {
              return match;
            }
            
            let fixedUrl = url;
            if (url.startsWith('/')) {
              fixedUrl = `${basePath}${url}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed CSS url: ${url} -> ${fixedUrl}`);
            }
            
            return `url(${prefix}${fixedUrl}${suffix})`;
          }
        );
        
        // Update file if changes were made
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          filesProcessed++;
          console.log(`Updated CSS: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  }
}

// Create .nojekyll file to prevent GitHub Pages from using Jekyll
function createNojekyllFile() {
  const filePath = path.join(outputDir, '.nojekyll');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log('Created .nojekyll file');
  }
}

// Create 404.html that redirects to index.html with path info
function create404Page() {
  const filePath = path.join(outputDir, '404.html');
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Capture the path and redirect to the homepage with it as a parameter
    var pathSegments = window.location.pathname.split('/');
    var repoName = '${repoName}';
    
    // Remove the repository name from the path if present
    if (pathSegments[1] === repoName) {
      pathSegments.splice(1, 1);
    }
    
    // Store the path for the homepage to handle
    sessionStorage.setItem('redirectPath', pathSegments.join('/'));
    
    // Redirect to homepage
    window.location.replace('/${repoName}/');
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
  `.trim();
  
  fs.writeFileSync(filePath, content);
  console.log('Created 404.html redirect page');
}

// Ensure public directory is copied correctly
function copyPublicFiles() {
  const publicDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    const items = fs.readdirSync(publicDir, { withFileTypes: true });
    
    for (const item of items) {
      const srcPath = path.join(publicDir, item.name);
      const destPath = path.join(outputDir, item.name);
      
      // Skip if file already exists in output
      if (fs.existsSync(destPath)) {
        continue;
      }
      
      if (item.isDirectory()) {
        // Copy directory recursively (simplified implementation)
        fs.mkdirSync(destPath, { recursive: true });
        // Note: This doesn't recursively copy directory contents - would need more code
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied public file: ${item.name}`);
      }
    }
  }
}

// Main execution
try {
  console.log('Starting path fixing for GitHub Pages deployment...');
  
  // Create essential files
  createNojekyllFile();
  create404Page();
  
  // Copy public files
  copyPublicFiles();
  
  // Process HTML, JS, and CSS files
  processHtmlFiles(outputDir);
  processJsFiles(outputDir);
  processCssFiles(outputDir);
  
  console.log(`
===== Path Fixing Complete =====
Files processed: ${filesProcessed}
Paths fixed: ${pathsFixed}
===============================
  `);
} catch (error) {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
}