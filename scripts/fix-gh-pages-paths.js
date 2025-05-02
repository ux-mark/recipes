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
const isCustomDomain = args.includes('--custom-domain') || process.env.USE_CUSTOM_DOMAIN === 'true';

// GitHub repo name - change this to match your repository name
const repoName = 'recipes';
const basePath = isCustomDomain ? '' : `/${repoName}`;

console.log(`Running GitHub Pages path fixer${isDebugMode ? ' (DEBUG MODE)' : ''}${isCustomDomain ? ' (CUSTOM DOMAIN MODE)' : ''}`);
console.log(`Base path: "${basePath}"`);
console.log(`Environment: USE_CUSTOM_DOMAIN=${process.env.USE_CUSTOM_DOMAIN || 'undefined'}`);

// Stats tracking
let filesProcessed = 0;
let pathsFixed = 0;

// NEW: Add debug logging function
function debug(message) {
  if (isDebugMode) {
    console.log(`[DEBUG] ${message}`);
  }
}

// NEW: Function to scan entire directory structure for problematic paths
function scanForProblematicPaths() {
  debug('Scanning for problematic paths in output directory...');
  
  // Records of issues found
  const issues = {
    recipesPathsInHtml: [],
    recipesPathsInJs: [],
    recipesPathsInCss: [],
    recipesPathsInJson: [],
    missingFiles: [],
    total: 0
  };
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
        continue;
      }
      
      // Skip binary files
      if (entry.name.match(/\.(jpg|jpeg|png|gif|ico|woff|woff2|ttf|eot)$/i)) {
        continue;
      }
      
      try {
        // Read file content
        const content = fs.readFileSync(fullPath, 'utf8');
        const relPath = path.relative(outputDir, fullPath);
        
        // Check for /recipes/ paths
        const recipesMatches = (content.match(/\/recipes\//g) || []).length;
        if (recipesMatches > 0) {
          if (entry.name.endsWith('.html')) {
            issues.recipesPathsInHtml.push({ file: relPath, count: recipesMatches });
          } else if (entry.name.endsWith('.js')) {
            issues.recipesPathsInJs.push({ file: relPath, count: recipesMatches });
          } else if (entry.name.endsWith('.css')) {
            issues.recipesPathsInCss.push({ file: relPath, count: recipesMatches });
          } else if (entry.name.endsWith('.json')) {
            issues.recipesPathsInJson.push({ file: relPath, count: recipesMatches });
          }
          issues.total += recipesMatches;
        }
        
        // Look for potential 404 references (paths that would generate 404s)
        const pathMatches = content.match(/["'](\/[^"']*\.(css|js|svg|png|jpg|jpeg|gif))["']/g);
        if (pathMatches) {
          for (const pathMatch of pathMatches) {
            // Extract the path from the match
            const extractedPath = pathMatch.replace(/^["']|["']$/g, '');
            
            // Check if the referenced file exists in the output directory
            const targetPath = path.join(outputDir, extractedPath);
            if (!fs.existsSync(targetPath)) {
              issues.missingFiles.push({ 
                file: relPath, 
                referencedPath: extractedPath 
              });
            }
          }
        }
      } catch (err) {
        debug(`Error scanning ${fullPath}: ${err.message}`);
      }
    }
  }
  
  scanDirectory(outputDir);
  
  // Print summary of issues
  console.log('\n===== Path Issue Scan Results =====');
  console.log(`Total /recipes/ path references found: ${issues.total}`);
  console.log(`HTML files with /recipes/ paths: ${issues.recipesPathsInHtml.length}`);
  console.log(`JS files with /recipes/ paths: ${issues.recipesPathsInJs.length}`);
  console.log(`CSS files with /recipes/ paths: ${issues.recipesPathsInCss.length}`);
  console.log(`JSON files with /recipes/ paths: ${issues.recipesPathsInJson.length}`);
  console.log(`Files referencing missing assets: ${issues.missingFiles.length}`);
  
  if (isDebugMode && issues.total > 0) {
    // Display detailed issues
    if (issues.recipesPathsInHtml.length > 0) {
      console.log('\nHTML files with /recipes/ paths:');
      issues.recipesPathsInHtml.forEach(i => console.log(`- ${i.file}: ${i.count} occurrences`));
    }
    
    if (issues.recipesPathsInJs.length > 0) {
      console.log('\nJS files with /recipes/ paths:');
      issues.recipesPathsInJs.forEach(i => console.log(`- ${i.file}: ${i.count} occurrences`));
    }
    
    if (issues.recipesPathsInCss.length > 0) {
      console.log('\nCSS files with /recipes/ paths:');
      issues.recipesPathsInCss.forEach(i => console.log(`- ${i.file}: ${i.count} occurrences`));
    }
    
    if (issues.missingFiles.length > 0) {
      console.log('\nPotential 404 references:');
      issues.missingFiles.slice(0, 20).forEach(i => 
        console.log(`- ${i.file} references non-existent: ${i.referencedPath}`)
      );
      if (issues.missingFiles.length > 20) {
        console.log(`...and ${issues.missingFiles.length - 20} more`);
      }
    }
  }
  
  return issues;
}

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
  
  // Add a special check for stylesheet links with absolute paths that might still have /recipes/ prefix
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        continue;
      } else if (item.name.endsWith('.html')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix stylesheet links that still have /recipes/ prefix
          const newContent = content.replace(
            /(<link[^>]+href=["'])\/recipes\/([^"']+)(["'][^>]*>)/g,
            (match, prefix, href, suffix) => {
              return `${prefix}/${href}${suffix}`;
            }
          );
          
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent);
            console.log(`Fixed custom domain stylesheet links in: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing custom domain paths in ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  // ENHANCED: More aggressive handling for custom domains
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        continue;
      } else if (item.name.endsWith('.html')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // More aggressive regex to catch all /recipes/ references
          let newContent = content;
          
          // Fix any attribute with /recipes/ in it
          newContent = newContent.replace(
            /\s(src|href|content|data-[a-z-]+)=["']([^"']*)\/recipes\/([^"']*)(["'])/g,
            (match, attr, prefix, path, suffix) => {
              // Don't modify external URLs
              if (prefix.includes('http')) {
                return match;
              }
              pathsFixed++;
              return ` ${attr}="${prefix}/${path}${suffix}`;
            }
          );
          
          // Fix inline styles with url(/recipes/...)
          newContent = newContent.replace(
            /(url\(["']?)\/recipes\/([^"')]+)(["']?\))/g,
            (match, prefix, path, suffix) => {
              pathsFixed++;
              return `${prefix}/${path}${suffix}`;
            }
          );
          
          // VERY aggressive - replace any /recipes/ reference in the entire HTML
          // This is a last resort but catches things we might miss
          if (isDebugMode) {
            // In debug mode, just identify these without replacing
            const remainingMatches = (newContent.match(/\/recipes\//g) || []).length;
            if (remainingMatches > 0) {
              console.log(`${fullPath} still has ${remainingMatches} /recipes/ references after normal fixes`);
            }
          } else {
            // In normal mode, aggressively fix any remaining references
            const beforeCount = (newContent.match(/\/recipes\//g) || []).length;
            if (beforeCount > 0) {
              newContent = newContent.replace(/\/recipes\//g, '/');
              pathsFixed += beforeCount;
              console.log(`Aggressively fixed ${beforeCount} remaining /recipes/ references in ${fullPath}`);
            }
          }
          
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent);
            filesProcessed++;
            console.log(`Updated HTML with aggressive fixes: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing custom domain paths in ${fullPath}: ${error.message}`);
        }
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
  
  // Add special handling for custom domain JS files with hardcoded /recipes/ paths
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        processJsFiles(fullPath);
      } else if (item.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix hardcoded /recipes/ paths in JS files for custom domains
          const newContent = content.replace(
            /(["'])\/recipes\/([^"']+)(["'])/g,
            (match, prefix, path, suffix) => {
              const fixedPath = `/${path}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed JS /recipes/ path for custom domain: /recipes/${path} -> ${fixedPath}`);
              return `${prefix}${fixedPath}${suffix}`;
            }
          );
          
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent);
            filesProcessed++;
            console.log(`Updated JS for custom domain: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  // ENHANCED: More aggressive handling for custom domains
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        processJsFiles(fullPath);
      } else if (item.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // More aggressive regex to catch all /recipes/ references
          let newContent = content;
          
          // Fix string literals with /recipes/
          newContent = newContent.replace(
            /(["'])([^"']*)\/recipes\/([^"']*)(["'])/g,
            (match, prefix, before, path, suffix) => {
              // Don't modify external URLs or URLs that already have a domain
              if (before.includes('http') || before.includes('://')) {
                return match;
              }
              pathsFixed++;
              return `${prefix}${before}/${path}${suffix}`;
            }
          );
          
          // VERY aggressive - replace any /recipes/ reference in the JS
          // This is a last resort but catches things we might miss
          if (isDebugMode) {
            // In debug mode, just identify these without replacing
            const remainingMatches = (newContent.match(/\/recipes\//g) || []).length;
            if (remainingMatches > 0) {
              console.log(`${fullPath} still has ${remainingMatches} /recipes/ references after normal fixes`);
            }
          } else {
            // In normal mode, aggressively fix any remaining references
            const beforeCount = (newContent.match(/\/recipes\//g) || []).length;
            if (beforeCount > 0) {
              newContent = newContent.replace(/\/recipes\//g, '/');
              pathsFixed += beforeCount;
              console.log(`Aggressively fixed ${beforeCount} remaining /recipes/ references in ${fullPath}`);
            }
          }
          
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent);
            filesProcessed++;
            console.log(`Updated JS with aggressive fixes: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}: ${error.message}`);
        }
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
  
  // Add special handling for CSS files with hardcoded /recipes/ paths
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        processCssFiles(fullPath);
      } else if (item.name.endsWith('.css')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix hardcoded /recipes/ paths in CSS files for custom domains
          const newContent = content.replace(
            /url\(\s*(['"]?)\/recipes\/([^'")]+)(['"]?)\s*\)/g,
            (match, prefix, url, suffix) => {
              const fixedUrl = `/${url}`;
              pathsFixed++;
              if (isDebugMode) console.log(`Fixed CSS url for custom domain: /recipes/${url} -> ${fixedUrl}`);
              return `url(${prefix}${fixedUrl}${suffix})`;
            }
          );
          
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent);
            filesProcessed++;
            console.log(`Updated CSS for custom domain: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  // ENHANCED: More aggressive handling for CSS files
  if (isCustomDomain) {
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        processCssFiles(fullPath);
      } else if (item.name.endsWith('.css')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Aggressively replace any /recipes/ in CSS for custom domains
          let newContent = content;
          const beforeCount = (newContent.match(/\/recipes\//g) || []).length;
          
          if (beforeCount > 0) {
            newContent = newContent.replace(/\/recipes\//g, '/');
            pathsFixed += beforeCount;
            console.log(`Aggressively fixed ${beforeCount} /recipes/ references in CSS: ${fullPath}`);
            
            fs.writeFileSync(fullPath, newContent);
            filesProcessed++;
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}: ${error.message}`);
        }
      }
    }
  }
}

// ENHANCED: Special handling for JSON files
function processJsonFiles(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      processJsonFiles(fullPath);
    } else if (item.name.endsWith('.json')) {
      try {
        // For custom domain mode, fix /recipes/ references in JSON files
        if (isCustomDomain) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // First check if the file has any /recipes/ references
          if (content.includes('/recipes/')) {
            // Try to parse as JSON
            try {
              const jsonData = JSON.parse(content);
              
              // Recursive function to fix paths in JSON
              function fixJsonPaths(obj) {
                if (!obj || typeof obj !== 'object') return obj;
                
                if (Array.isArray(obj)) {
                  return obj.map(item => fixJsonPaths(item));
                }
                
                const result = { ...obj };
                
                for (const [key, value] of Object.entries(result)) {
                  if (typeof value === 'string' && value.includes('/recipes/')) {
                    result[key] = value.replace(/\/recipes\//g, '/');
                    pathsFixed++;
                  } else if (value && typeof value === 'object') {
                    result[key] = fixJsonPaths(value);
                  }
                }
                
                return result;
              }
              
              const fixedJson = fixJsonPaths(jsonData);
              const fixedContent = JSON.stringify(fixedJson, null, 2);
              
              if (content !== fixedContent) {
                fs.writeFileSync(fullPath, fixedContent);
                filesProcessed++;
                console.log(`Updated JSON paths: ${fullPath}`);
              }
            } catch (err) {
              // If not valid JSON or other error, use string replacement
              const newContent = content.replace(/\/recipes\//g, '/');
              if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                filesProcessed++;
                console.log(`Updated JSON paths using string replacement: ${fullPath}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing JSON file ${fullPath}: ${error.message}`);
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
  
  // Custom 404 page content depending on domain type
  let content;
  
  if (isCustomDomain) {
    // Enhanced version for custom domains - redirect to the root
    content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Capture the path and redirect to the homepage with it as a parameter
    (function() {
      // Store the full path including query string and hash
      const path = window.location.pathname + 
                  (window.location.search || '') + 
                  (window.location.hash || '');
      
      // Store the path for the homepage to handle
      if (path && path !== '/') {
        sessionStorage.setItem('redirectPath', path);
      }
      
      // Redirect to homepage
      window.location.replace('/');
    })();
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
    `.trim();
  } else {
    // GitHub Pages version - needs repo name handling
    content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Capture the path and redirect to the homepage with it as a parameter
    (function() {
      // Store the full path including query string and hash
      const path = window.location.pathname + 
                  (window.location.search || '') + 
                  (window.location.hash || '');
      
      const pathSegments = window.location.pathname.split('/');
      const repoName = '${repoName}';
      
      // Store the path for the homepage to handle
      if (path) {
        sessionStorage.setItem('redirectPath', path);
      }
      
      // Redirect to homepage
      window.location.replace('/${repoName}/');
    })();
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
    `.trim();
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Created 404.html redirect page');
}

// Ensure the CNAME file is copied correctly
function ensureCnameFile() {
  if (isCustomDomain) {
    const srcCnamePath = path.resolve(__dirname, '../CNAME');
    const destCnamePath = path.join(outputDir, 'CNAME');
    
    if (fs.existsSync(srcCnamePath)) {
      // Copy CNAME from root directory
      fs.copyFileSync(srcCnamePath, destCnamePath);
      const domain = fs.readFileSync(destCnamePath, 'utf8').trim();
      console.log(`Custom domain: ${domain} (CNAME file copied)`);
    } else {
      // Check if CNAME already exists in public directory
      const publicCnamePath = path.resolve(__dirname, '../public/CNAME');
      
      if (fs.existsSync(publicCnamePath)) {
        fs.copyFileSync(publicCnamePath, destCnamePath);
        const domain = fs.readFileSync(destCnamePath, 'utf8').trim();
        console.log(`Custom domain: ${domain} (CNAME file copied from public directory)`);
      } else if (!fs.existsSync(destCnamePath)) {
        // Create a warning message if no CNAME is found
        console.warn('\x1b[33m%s\x1b[0m', 'WARNING: CNAME file not found. Custom domain might not work correctly.');
      }
    }
  } else if (fs.existsSync(path.join(outputDir, 'CNAME'))) {
    // If not in custom domain mode but CNAME exists, log a warning
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: CNAME file exists but custom domain mode is not enabled.');
  }
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

// Check and fix JSON data in Next.js data islands
function fixNextDataIslands() {
  const htmlFiles = [];
  
  // Find all HTML files
  function findHtmlFiles(directory) {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        findHtmlFiles(fullPath);
      } else if (item.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }
  
  findHtmlFiles(outputDir);
  
  // Process each HTML file for Next.js data islands
  for (const filePath of htmlFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Check for Next.js data islands
      if (content.includes('__NEXT_DATA__')) {
        let newContent = content.replace(
          /(<script id="__NEXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/g,
          (match, openTag, jsonContent, closeTag) => {
            try {
              const json = JSON.parse(jsonContent);
              
              // Function to fix paths in the object
              function fixPaths(obj) {
                if (!obj || typeof obj !== 'object') return obj;
                
                // Handle arrays
                if (Array.isArray(obj)) {
                  return obj.map(item => fixPaths(item));
                }
                
                // Handle objects
                const result = { ...obj };
                
                for (const key in result) {
                  const value = result[key];
                  
                  if (typeof value === 'string') {
                    // Fix paths in string values
                    if (value.startsWith('/') && 
                        !value.startsWith('//') && 
                        !value.startsWith('/api/') && 
                        !value.startsWith('/recipes') &&
                        !value.startsWith('/_next/')) {
                      
                      if (isCustomDomain) {
                        // For custom domain - keep paths as is
                        result[key] = value;
                      } else {
                        // For GitHub Pages - add repository prefix
                        result[key] = basePath + value;
                        if (isDebugMode) {
                          console.log(`Fixed path in JSON: ${value} -> ${result[key]}`);
                        }
                        pathsFixed++;
                      }
                    } else if (!isCustomDomain && value.startsWith('/recipes') && basePath !== '/recipes') {
                      // Handle edge case where basePath might be different
                      result[key] = basePath + value.substring('/recipes'.length);
                      if (isDebugMode) {
                        console.log(`Fixed path in JSON: ${value} -> ${result[key]}`);
                      }
                      pathsFixed++;
                    } else if (isCustomDomain && value.startsWith('/recipes/')) {
                      // Remove '/recipes' prefix for custom domains
                      result[key] = value.replace('/recipes/', '/');
                      if (isDebugMode) {
                        console.log(`Fixed path in JSON: ${value} -> ${result[key]}`);
                      }
                      pathsFixed++;
                    }
                  } else if (value && typeof value === 'object') {
                    // Recursively process nested objects
                    result[key] = fixPaths(value);
                  }
                }
                
                return result;
              }
              
              // Fix paths in the JSON data
              const fixedJson = fixPaths(json);
              
              // Only update if changes were made (comparing stringified versions would always be different due to whitespace)
              const newJsonContent = JSON.stringify(fixedJson);
              if (newJsonContent !== jsonContent) {
                modified = true;
                return `${openTag}${newJsonContent}${closeTag}`;
              }
            } catch (error) {
              console.error(`Error processing JSON in ${filePath}: ${error.message}`);
            }
            
            return match;
          }
        );
        
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          filesProcessed++;
          console.log(`Updated Next.js data island in: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}: ${error.message}`);
    }
  }
  
  // Add enhanced handling for Next.js data islands in custom domain mode
  function enhancedFixPaths(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => enhancedFixPaths(item));
    }
    
    // Handle objects
    const result = { ...obj };
    
    for (const key in result) {
      const value = result[key];
      
      if (typeof value === 'string') {
        // For custom domains, remove ALL /recipes/ prefixes
        if (isCustomDomain && value.includes('/recipes/')) {
          result[key] = value.replace(/\/recipes\//g, '/');
          pathsFixed++;
          if (isDebugMode) {
            console.log(`Fixed deep path in JSON for custom domain: ${value} -> ${result[key]}`);
          }
        }
      } else if (value && typeof value === 'object') {
        // Recursively process nested objects
        result[key] = enhancedFixPaths(value);
      }
    }
    
    return result;
  }
  
  // In custom domain mode, do a special pass on all HTML files to find and fix data islands
  if (isCustomDomain) {
    const htmlFiles = [];
    
    // Find all HTML files
    function findHtmlFiles(dir) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          findHtmlFiles(fullPath);
        } else if (item.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    }
    
    findHtmlFiles(outputDir);
    
    // Process each HTML file
    for (const filePath of htmlFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for inline scripts with hardcoded paths
        const newContent = content.replace(
          /(["'])\/recipes\/([^"']+)(["'])/g,
          (match, prefix, p, suffix) => {
            const fixed = `${prefix}/${p}${suffix}`;
            pathsFixed++;
            return fixed;
          }
        );
        
        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent);
          console.log(`Fixed hardcoded /recipes/ paths in: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error fixing hardcoded paths in ${filePath}: ${error.message}`);
      }
    }
  }
}

// NEW: Fix Next.js chunk loading configuration
function fixNextJsChunkLoading() {
  if (!isCustomDomain) return; // Only needed for custom domain
  
  // Look for the main HTML file
  const indexPath = path.join(outputDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Find and modify the next chunk loading logic
    let modified = false;
    
    // This targets Next.js runtime configuration where assetPrefix might be set
    content = content.replace(
      /(\s*(?:var|let|const)\s+[_$a-zA-Z0-9]+\s*=\s*{[^}]*["']assetPrefix["']\s*:\s*["'])\/recipes\/(["'][^}]*})/g,
      (match, prefix, suffix) => {
        modified = true;
        pathsFixed++;
        return `${prefix}/${suffix}`;
      }
    );
    
    // Target any basePath setting in runtime config
    content = content.replace(
      /(\s*(?:var|let|const)\s+[_$a-zA-Z0-9]+\s*=\s*{[^}]*["']basePath["']\s*:\s*["'])\/recipes(["'][^}]*})/g,
      (match, prefix, suffix) => {
        modified = true;
        pathsFixed++;
        return `${prefix}${suffix}`;
      }
    );
    
    if (modified) {
      fs.writeFileSync(indexPath, content);
      filesProcessed++;
      console.log('Fixed Next.js chunk loading configuration in index.html');
    }
  } catch (error) {
    console.error(`Error fixing Next.js chunk loading: ${error.message}`);
  }
}

// NEW: Verify generated files accessibility
function verifyGeneratedFiles() {
  if (!isCustomDomain) return;
  
  console.log('\nVerifying generated files accessibility...');
  
  // Check critical files
  const criticalPaths = [
    '/_next/static/css/',
    '/_next/static/chunks/',
    '/images/'
  ];
  
  // Get directory stats
  const stats = {
    cssFiles: 0,
    jsChunks: 0,
    imageFiles: 0
  };
  
  // Count files in directories
  for (const criticalPath of criticalPaths) {
    const fullPath = path.join(outputDir, criticalPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`\x1b[33mWARNING: Critical path doesn't exist: ${criticalPath}\x1b[0m`);
      continue;
    }
    
    try {
      const files = fs.readdirSync(fullPath, { recursive: true });
      if (criticalPath.includes('css')) stats.cssFiles = files.length;
      if (criticalPath.includes('chunks')) stats.jsChunks = files.length;
      if (criticalPath.includes('images')) stats.imageFiles = files.length;
      
      console.log(`${criticalPath}: ${files.length} files`);
    } catch (error) {
      console.warn(`\x1b[33mWARNING: Error accessing ${criticalPath}: ${error.message}\x1b[0m`);
    }
  }
  
  // Check HTML files for _next references
  const htmlFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.html'));
  for (const htmlFile of htmlFiles.slice(0, 3)) { // Check first 3 HTML files
    try {
      const content = fs.readFileSync(path.join(outputDir, htmlFile), 'utf8');
      
      // Check for stylesheet links
      const cssLinks = (content.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/g) || []).length;
      
      // Check for script tags
      const scriptTags = (content.match(/<script[^>]+src=["'][^"']*\/_next\/[^"']*["'][^>]*>/g) || []).length;
      
      console.log(`${htmlFile}: ${cssLinks} CSS links, ${scriptTags} script references`);
      
      // Verify the links actually point to files that exist
      const linkMatches = content.matchAll(/(?:href|src)=["']([^"']*\/_next\/[^"']*)["']/g);
      for (const match of linkMatches) {
        const assetPath = match[1];
        const fullAssetPath = path.join(outputDir, assetPath);
        
        if (!fs.existsSync(fullAssetPath)) {
          console.warn(`\x1b[33mWARNING: ${htmlFile} references non-existent file: ${assetPath}\x1b[0m`);
        }
      }
    } catch (error) {
      console.warn(`\x1b[33mWARNING: Error analyzing ${htmlFile}: ${error.message}\x1b[0m`);
    }
  }
}

// Main execution
try {
  console.log('Starting path fixing for GitHub Pages deployment...');
  console.log(`Custom domain mode: ${isCustomDomain ? 'ENABLED' : 'DISABLED'}`);
  
  // Create essential files
  createNojekyllFile();
  create404Page();
  ensureCnameFile();
  
  // Copy public files
  copyPublicFiles();
  
  // NEW: Debug scan before changes
  if (isDebugMode) {
    console.log('\nScanning for issues before applying fixes...');
    scanForProblematicPaths();
  }
  
  // Process all file types
  processHtmlFiles(outputDir);
  processJsFiles(outputDir);
  processCssFiles(outputDir);
  processJsonFiles(outputDir); // NEW: Added JSON file processing
  fixNextDataIslands();
  fixNextJsChunkLoading(); // NEW: Fix chunk loading configuration
  
  // Add verification steps
  if (isCustomDomain) {
    // Do a second pass of very aggressive fixing for custom domain mode
    console.log('\nPerforming second pass for very aggressive path fixing...');
    
    // Check all files again and fix any remaining issues
    const items = fs.readdirSync(outputDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(outputDir, item.name);
      
      if (item.isDirectory()) {
        // Skip certain directories that shouldn't need path fixing
        if (item.name === 'images' || item.name === 'node_modules') {
          continue;
        }
        
        processHtmlFiles(fullPath);
        processJsFiles(fullPath);
        processCssFiles(fullPath);
      }
    }
    
    verifyGeneratedFiles(); // NEW: Add verification step
    
    // Scan for remaining issues
    console.log('\nScanning for any remaining issues after fixes...');
    const remainingIssues = scanForProblematicPaths();
    
    if (remainingIssues.total > 0) {
      console.warn(`\x1b[33mWARNING: There are still ${remainingIssues.total} /recipes/ references after all fixes\x1b[0m`);
    } else {
      console.log('\x1b[32mSuccess: No remaining /recipes/ references found!\x1b[0m');
    }
  } else {
    console.log('\nVerifying GitHub Pages paths...');
    // Ensure paths are properly prefixed for GitHub Pages
    
    // Check a few HTML files
    const sampleHtmlFiles = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.html'))
      .slice(0, 3);
      
    for (const file of sampleHtmlFiles) {
      const content = fs.readFileSync(path.join(outputDir, file), 'utf8');
      
      // Check for _next/ paths without repository prefix
      const unprefixedNextPaths = (content.match(/["']\/_next\//g) || []).length;
      const prefixedNextPaths = (content.match(/["']\/recipes\/_next\//g) || []).length;
      
      if (unprefixedNextPaths > 0 && prefixedNextPaths === 0) {
        console.warn(`\x1b[33mWARNING: ${file} contains ${unprefixedNextPaths} unprefixed /_next/ paths\x1b[0m`);
      } else {
        console.log(`✓ ${file} looks good - ${prefixedNextPaths} properly prefixed /_next/ paths`);
      }
    }
  }
  
  console.log(`
===== Path Fixing Complete =====
Files processed: ${filesProcessed}
Paths fixed: ${pathsFixed}
Custom Domain Mode: ${isCustomDomain ? 'ENABLED' : 'DISABLED'}
===============================
  `);
} catch (error) {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
}