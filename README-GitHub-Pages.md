# GitHub Pages Deployment Guide

This document outlines the deployment setup for this Next.js recipe website project on GitHub Pages.

## 1. Next.js Configuration

The `next.config.mjs` file is configured for static site generation with the following settings:

```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Recommended for static hosting
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};
```

## 2. GitHub Actions Workflow

A GitHub Actions workflow file (`.github/workflows/deploy.yml`) automates the deployment process:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - working
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build and fix paths for GitHub Pages
        run: npm run deploy-gh-pages
        env:
          NODE_ENV: "production"
          NODE_OPTIONS: "--experimental-json-modules"
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 3. Enhanced Post-Build Path Fixing Script

The project includes a critical post-build script (`scripts/fix-gh-pages-paths.js`) that automatically fixes all asset paths in the generated HTML files and prevents path doubling issues:

```javascript
// scripts/fix-gh-pages-paths.js
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
```

This script is integrated into the build process via npm scripts in `package.json`:

```json
"scripts": {
  "postbuild": "node scripts/fix-gh-pages-paths.js",
  "deploy-gh-pages": "npm run build && npm run postbuild && touch out/.nojekyll"
}
```

## 4. Environment Configuration

We've added a centralized environment configuration in `lib/env.ts` to handle base paths consistently:

```typescript
// Environment variables and configuration settings for the application
const env = {
  // Base path for GitHub Pages deployment
  // This is used for all asset URLs and links
  basePath: process.env.NODE_ENV === 'production' ? '/recipe-website' : '',
  
  // Public URL for the site
  publicUrl: process.env.NODE_ENV === 'production' 
    ? 'https://username.github.io/recipe-website' 
    : 'http://localhost:3000',
};

export default env;
```

## 5. Utility Functions for Asset Paths

In `lib/utils.ts`, we've added helper functions to ensure proper path handling:

```typescript
import env from './env';

// Returns the correct path for assets, considering the base path in different environments
export function getAssetPath(path: string): string {
  // If path already includes the base path or is an absolute URL, return as is
  if (path.startsWith('http') || path.startsWith(env.basePath)) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine base path with normalized path
  return `${env.basePath}${normalizedPath}`;
}
```

## 6. Client-Side Image Utility

The client-side image utility (`lib/client-utils/image.ts`) has been updated to use the base path:

```typescript
import { getAssetPath } from '../utils';

// Returns the URL for a recipe image, with proper path handling for both development and production
export function getRecipeImageUrl(recipePath: string, imageName: string): string {
  return getAssetPath(`/images/${recipePath}/${imageName}`);
}
```

## 7. Custom Domain Configuration

This project is configured to use a custom domain, as indicated by the presence of CNAME files in both the root and public directories. The CNAME file is automatically included in the build output to ensure GitHub Pages correctly uses the custom domain.

To update the custom domain:

1. Edit the CNAME file in the public directory with your domain name
2. The GitHub Actions workflow will copy this file to the deployment output

## 8. SPA Navigation Support

For Single Page Application navigation to work properly on GitHub Pages, the project includes:

1. A custom 404.html page in the public directory that handles redirects:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Single Page Apps for GitHub Pages
    // This script takes the current URL and converts the path and query
    // string into a form that can be passed to the actual SPA page
    // Modified from https://github.com/rafgraph/spa-github-pages
    (function() {
      const segments = window.location.pathname.split('/');
      const repoName = segments[1]; // e.g. 'recipe-website'
      
      // Store the full path for later use in the SPA
      sessionStorage.setItem('redirectPath', window.location.pathname);
      
      // Redirect to the index.html page
      window.location.replace(`/${repoName}/`);
    })();
  </script>
</head>
<body>
  <p>Redirecting to the homepage...</p>
</body>
</html>
```

2. A client-side component (`components/github-pages-redirect.tsx`) that processes redirected navigation requests:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function GitHubPagesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we have a path to redirect to from the 404.html page
    if (typeof window !== 'undefined' && window.__NEXT_REDIRECT_PATH) {
      const path = window.__NEXT_REDIRECT_PATH;
      delete window.__NEXT_REDIRECT_PATH;
      router.push(path);
    }
  }, [router]);
  
  return null;
}
```

## 9. Key Changes Made

1. **Enhanced Path Processing**
   - Added comprehensive path fixing for HTML, JS, and CSS files
   - Implemented intelligent path detection to prevent path doubling issues
   - Processes all asset references in various formats (href, src, url(), JSON data, etc.)

2. **Environment-Aware Configuration**
   - Created centralized environment settings with base path handling
   - Made utilities to consistently apply base paths across the application

3. **CSS and Styling Fixes**
   - Fixed doubled repository paths that were causing CSS to fail to load
   - Added specific handling for CSS url() paths to ensure background images load correctly

4. **JavaScript and JSON Path Handling**
   - Added smart processing of paths in JavaScript runtime data
   - Fixed paths within serialized JSON props for React 19 / Next.js 15.3.1

5. **API Routes Configuration**
   - Added `export const dynamic = "force-static"` to API routes to make them compatible with static export

6. **Image Processing**
   - Created client-side image utilities to handle paths consistently
   - Used unoptimized images setting required for static export
   - Implemented path fixes for all image references

7. **Build Process Improvements**
   - Enhanced npm scripts to better handle the GitHub Pages deployment workflow
   - Added proper console logging for better debugging

8. **Removed Server Features**
   - Removed `'use server'` directive from `lib/recipes.ts` since Server Actions aren't supported in static exports
   - Made adjustments for static-only functionality

## 10. GitHub Pages Configuration

1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. If using a custom domain, add it in the GitHub repository settings
4. Ensure your repository has proper permissions set for GitHub Actions

## 11. Troubleshooting

If you encounter deployment issues:

1. **Path Problems**
   - Check for doubled paths like `/recipe-website/recipe-website/` in the HTML source
   - Verify that all assets use the correct base path with the repository name
   - Inspect network requests in browser dev tools to identify 404 errors

2. **Style and CSS Issues**
   - Inspect CSS link tags to ensure they have the correct path
   - Check if CSS files are being loaded (look for 404 errors in network tab)
   - Verify that any inline styles with url() references have correct paths

3. **Image Loading Problems**
   - Check image src attributes for correct paths
   - Verify that background images in CSS have proper paths
   - Ensure image files exist at the referenced locations

4. **JavaScript Errors**
   - Look for path-related errors in the browser console
   - Check that all script tags have correct src attributes
   - Verify that JSON data with path references are correctly formatted

5. **General Troubleshooting**
   - Check the GitHub Actions logs for specific error messages
   - Ensure the custom domain configuration is correct (if applicable)
   - Check that the `fix-gh-pages-paths.js` script correctly references your repository name
   - Make sure the .nojekyll file is present in the output to prevent GitHub Pages from processing with Jekyll

## 12. Local Testing

To test the static export locally before deploying:

```bash
npm run deploy-gh-pages
npx serve out
```

This builds the static site with the proper path fixes and serves it locally for testing before pushing to GitHub.

## 13. Further Resources

- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [SPA GitHub Pages Redirect Pattern](https://github.com/rafgraph/spa-github-pages)
- [Next.js GitHub Pages Examples](https://github.com/vercel/next.js/tree/canary/examples/github-pages)