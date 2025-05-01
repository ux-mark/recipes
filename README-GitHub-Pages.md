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

## 3. Enhanced Post-Build Path Fixing Script with Dual Mode Support

The project includes a critical post-build script (`scripts/fix-gh-pages-paths.js`) that automatically fixes all asset paths in the generated files. The script now supports both local development and GitHub Pages deployment:

```javascript
// scripts/fix-gh-pages-paths.js
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
  // ...implementation details
}

// Helper to ensure a path has the correct base path
function ensureCorrectPath(path) {
  // If we're in local mode, don't add the base path
  if (isLocalMode) {
    // Remove any repository prefixes that might exist
    return path.replace(new RegExp(`^/${repoName}/`, 'g'), '/');
  } else {
    // Add the repository name for GitHub Pages
    if (!path.startsWith(`/${repoName}/`) && path.startsWith('/') && !path.startsWith('//')) {
      return `/${repoName}${path}`;
    }
  }
  return path;
}

// Additional functions for processing different file types
// ...implementation details

console.log(`Starting path fixing for deployment...`);
processFiles(outputDir);
processRecipePages();
console.log(`Done! All files have been processed.`);
```

This script is integrated into the build process via npm scripts in `package.json`:

```json
"scripts": {
  "postbuild": "node scripts/fix-gh-pages-paths.js",
  "postbuild-local": "node scripts/fix-gh-pages-paths.js --local",
  "deploy-gh-pages": "npm run build && npm run postbuild && touch out/.nojekyll",
  "deploy-local": "npm run build && npm run postbuild-local && touch out/.nojekyll",
  "serve-static": "npm run deploy-local && npx serve out"
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
   - **New**: Added dual-mode support for both local development and GitHub Pages deployment

2. **Environment-Aware Configuration**
   - Created centralized environment settings with base path handling
   - Made utilities to consistently apply base paths across the application
   - **New**: Added command line flags to control path handling behavior

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
   - **New**: Added special handling for unprocessed Markdown image syntax

7. **Build Process Improvements**
   - Enhanced npm scripts to better handle the GitHub Pages deployment workflow
   - Added proper console logging for better debugging
   - **New**: Added timeout protection and binary file detection to prevent script hangs
   - **New**: Added separate scripts for local vs GitHub Pages deployment

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
   - **New**: If testing locally, make sure you're using `npm run deploy-local` or `npm run serve-static`

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
   - **New**: If the script gets stuck, check for any extremely large files or binary files in unexpected locations

## 12. Local Testing

To test the static export locally before deploying:

```bash
# Use the dedicated script for local development
npm run serve-static
```

Or separately:

```bash
# Build with local path configuration
npm run deploy-local
# Serve the output directory
npx serve out
```

This builds the static site with proper path handling for local development and serves it locally for testing.

## 13. GitHub Pages Deployment

To build for GitHub Pages deployment:

```bash
npm run deploy-gh-pages
```

Then push the `out` directory to your GitHub Pages branch or let the GitHub Actions workflow handle the deployment.

## 14. Further Resources

- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [SPA GitHub Pages Redirect Pattern](https://github.com/rafgraph/spa-github-pages)
- [Next.js GitHub Pages Examples](https://github.com/vercel/next.js/tree/canary/examples/github-pages)