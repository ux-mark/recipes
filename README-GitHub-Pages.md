# GitHub Pages Deployment Guide

This document outlines the deployment setup for this Next.js recipe website project on GitHub Pages.

## 1. Next.js Configuration

The `next.config.mjs` file is configured for static site generation with the following settings:

```javascript
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === "production" ? '/recipes' : '',
  assetPrefix: process.env.NODE_ENV === "production" ? '/recipes/' : '',
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

A GitHub Actions workflow file (`.github/workflows/deploy.yml`) automates the deployment process with support for both GitHub Pages and custom domains:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - working
  workflow_dispatch:
    inputs:
      domain_type:
        description: 'Deployment Type'
        required: true
        default: 'github-pages'
        type: choice
        options:
          - github-pages
          - custom-domain

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
      - name: Build for GitHub Pages (default)
        if: ${{ github.event_name == 'push' || github.event.inputs.domain_type == 'github-pages' }}
        run: npm run deploy-gh-pages
        env:
          NODE_ENV: "production"
          NODE_OPTIONS: "--experimental-json-modules"
          USE_CUSTOM_DOMAIN: "false"
      - name: Build for Custom Domain
        if: ${{ github.event.inputs.domain_type == 'custom-domain' }}
        run: npm run deploy-custom-domain
        env:
          NODE_ENV: "production"
          NODE_OPTIONS: "--experimental-json-modules"
          USE_CUSTOM_DOMAIN: "true"
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

## 3. Enhanced Post-Build Path Fixing Script with Multiple Deployment Mode Support

The project includes a critical post-build script (`scripts/fix-gh-pages-paths.js`) that automatically fixes all asset paths in the generated files. The script now supports GitHub Pages deployment, local development, and custom domains:

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
const isDebugMode = args.includes('--debug');
const isCustomDomain = args.includes('--custom-domain');
const isLocalMode = args.includes('--local');

// GitHub repo name - change this to match your repository name
const repoName = 'recipes';
// The base path to use in URLs - empty for custom domain or local mode, repo name for GitHub Pages
const basePath = isCustomDomain || isLocalMode ? '' : `/${repoName}`;

console.log(`Running GitHub Pages path fixer${isDebugMode ? ' (DEBUG MODE)' : ''}${isCustomDomain ? ' (CUSTOM DOMAIN MODE)' : ''}${isLocalMode ? ' (LOCAL MODE)' : ''}`);
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
  "postbuild-custom-domain": "node scripts/fix-gh-pages-paths.js --custom-domain",
  "deploy": "npm run build && touch out/.nojekyll",
  "deploy-gh-pages": "npm run build && npm run postbuild && touch out/.nojekyll",
  "deploy-local": "npm run build && npm run postbuild-local && touch out/.nojekyll",
  "deploy-custom-domain": "npm run build && npm run postbuild-custom-domain && touch out/.nojekyll",
  "serve-static": "npm run deploy-local && npx serve out"
}
```

## 4. Environment Configuration

We've enhanced the centralized environment configuration in `lib/env.ts` to handle base paths consistently and support custom domains:

```typescript
/**
 * Environment configuration
 * 
 * This file centralizes environment-specific settings to make them
 * consistently available throughout the application.
 */

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const isClientSide = typeof window !== 'undefined';
const isCustomDomain = typeof process !== 'undefined' && process.env.USE_CUSTOM_DOMAIN === 'true';

export const env = {
  /**
   * Base path for the application
   * In production (GitHub Pages), this will be /recipes unless using a custom domain
   * In development, this will be empty
   * When using a custom domain (process.env.USE_CUSTOM_DOMAIN=true), this will be empty
   */
  basePath: isProduction && !isCustomDomain ? '/recipes' : '',
  
  /**
   * Whether the application is running in production mode
   */
  isProduction,
  
  /**
   * Whether the application is running on the client side
   */
  isClientSide,
  
  /**
   * Whether the application is using a custom domain
   */
  isCustomDomain,
};
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

To deploy with the custom domain configuration:

1. Edit the CNAME file in the public directory with your domain name
2. Use one of two deployment methods:
   - Run the GitHub Actions workflow with "custom-domain" option selected
   - Run `npm run deploy-custom-domain` locally and push to GitHub

The custom domain deployment will:
- Build the site without the `/recipes` path prefix
- Generate assets with root-relative URLs (e.g., `/styles.css` instead of `/recipes/styles.css`)
- Create a custom 404.html page optimized for custom domain navigation
- Set the environment variable `USE_CUSTOM_DOMAIN=true` to control path behavior

### Switching Between GitHub Pages and Custom Domains

The project now supports seamless switching between GitHub Pages subdirectory hosting and custom domain hosting:

1. **For GitHub Pages deployment**:
   - Use the default GitHub Actions workflow
   - Or run `npm run deploy-gh-pages` locally

2. **For custom domain deployment**:
   - Select "custom-domain" when manually running the GitHub Actions workflow
   - Or run `npm run deploy-custom-domain` locally

### Troubleshooting Custom Domain Issues

If you encounter 404 errors on your custom domain:

1. Verify your DNS settings point to GitHub Pages correctly
2. Ensure you've deployed using the custom domain mode
3. Check the browser console for 404 errors and verify paths don't include the repository name
4. Confirm the CNAME file is present in your deployed site
5. Wait for DNS propagation (can take up to 48 hours)

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

9. **Custom Domain Support**
   - Added `--custom-domain` flag to the path fixing script
   - Created custom build and deployment scripts for custom domain usage
   - Added `USE_CUSTOM_DOMAIN` environment variable to control path behavior
   - Updated 404.html generation for optimal handling of different hosting scenarios
   - Modified GitHub Actions workflow to support custom domain deployments

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

6. **Custom Domain Issues**
   - If assets fail to load on your custom domain, make sure you've deployed using the custom domain mode
   - Check that paths in your HTML don't include the repository name (should be root-relative paths)
   - Verify that all environment variables are set correctly during build
   - If switching from GitHub Pages to custom domain, make a fresh deployment with the custom domain option

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

## 15. Repository Name Configuration

The GitHub repository name is a critical part of the path configuration for GitHub Pages. All asset paths need to be prefixed with the repository name (e.g., `/repository-name/path/to/asset`) to work correctly.

### Key Files with Repository Name References

The following files have been updated to use the correct repository name (`recipes`):

1. **scripts/fix-gh-pages-paths.js**
   ```javascript
   // GitHub repo name - change this to match your repository name
   const repoName = 'recipes';
   const basePath = `/${repoName}`;
   ```

2. **components/asset-path.tsx**
   ```typescript
   // If it's already prefixed with the repo name, don't change it
   if (src.startsWith('/recipes/')) {
     return src;
   }
   
   // Add the repository name prefix for absolute paths
   if (src.startsWith('/')) {
     return `/recipes${src}`;
   }
   
   // Add the repository name prefix for relative paths
   return `/recipes/${src}`;
   ```

3. **lib/env.ts**
   ```typescript
   /**
    * Base path for the application
    * In production (GitHub Pages), this will be /recipes
    * In development, this will be empty
    */
   basePath: isProduction ? '/recipes' : '',
   ```

4. **next.config.mjs** (shown above)

5. **public/404.html**
   ```javascript
   // Only redirect if this is the GitHub Pages site
   if (repoName === 'recipes') {
     // Store the path in sessionStorage
     sessionStorage.setItem('redirectPath', path);
     
     // Redirect to the base URL
     window.location.replace('/' + repoName + '/');
   }
   ```

6. **public/.htaccess**
   ```apache
   # If the requested file doesn't exist, try adding the repository name prefix
   RewriteRule ^(.*)$ /recipes/$1 [L,QSA]
   
   # Handle 404 errors by redirecting to the main page
   ErrorDocument 404 /recipes/index.html
   ```

### Fixing Repository Name Mismatches

If you encounter 404 errors after deployment, check:

1. **Verify Repository Name**: Ensure the repository name in the GitHub URL matches the one used in your configuration files
2. **Inspect Network Requests**: Use browser developer tools to identify which assets have incorrect paths
3. **Check Hardcoded Paths**: Search your codebase for any hardcoded paths that may not have been updated

To change the repository name throughout the codebase:

1. Update the `repoName` variable in `scripts/fix-gh-pages-paths.js`
2. Modify the `basePath` and `assetPrefix` values in `next.config.mjs`
3. Update the environment variables in `lib/env.ts`
4. Check any custom components like `asset-path.tsx` that may have hardcoded paths
5. Update references in special files like `404.html` and `.htaccess`

After making these changes, rebuild and deploy your site to see the changes take effect.

## 16. Custom Domain vs GitHub Pages Configuration

The site now supports two distinct deployment modes:

### GitHub Pages Subdirectory Mode
In this mode, the site is hosted at `https://username.github.io/recipes/` and requires all asset paths to be prefixed with `/recipes/`.

**Configuration:**
- `basePath` is set to `/recipes`
- Fixed paths include the repository name prefix
- 404.html includes repository-aware redirection

**When to use:**
- When hosting directly on GitHub Pages without a custom domain
- When you want to maintain the site as a subdirectory of your GitHub Pages site

### Custom Domain Mode
In this mode, the site is hosted at your custom domain (e.g., `https://yourdomain.com/`) and all asset paths are relative to the root without the repository prefix.

**Configuration:**
- `basePath` is set to an empty string
- No repository name prefix is added to paths
- 404.html has simplified redirect logic for custom domains

**When to use:**
- When using a custom domain pointed to your GitHub Pages site
- When you need clean URLs without the repository name in paths

### How to Switch Between Modes

1. **Via GitHub Actions:**
   - Go to the "Actions" tab in your GitHub repository
   - Select the "Deploy to GitHub Pages" workflow
   - Click "Run workflow"
   - Select either "github-pages" or "custom-domain" from the dropdown
   - Click "Run workflow" to deploy with the selected configuration

2. **Manually:**
   - For GitHub Pages: `npm run deploy-gh-pages`
   - For custom domain: `npm run deploy-custom-domain`

This dual-mode approach ensures maximum flexibility and compatibility with different hosting scenarios while maintaining a single codebase.

## 17. Custom Domain 404 Error Fixes

When deploying to a custom domain, you might encounter 404 errors for images and styles. These typically occur because some paths are still hardcoded with the `/recipes` prefix even when in custom domain mode. The following fixes address these issues:

### 1. Updated `asset-path.tsx` to Use Environment Configuration

The asset path component now properly checks the environment to determine whether to add the `/recipes` prefix:

```typescript
'use client';

import { useMemo } from 'react';
import { env } from '../lib/env';

// Component that handles proper asset path resolution for GitHub Pages
export function AssetImage({ src, alt = '', className = '', width, height }: AssetPathProps) {
  const fixedSrc = useMemo(() => {
    // Don't modify external URLs or data URLs
    if (src.startsWith('http') || src.startsWith('data:')) {
      return src;
    }
    
    // If it's already prefixed with the repo name, don't change it
    if (src.startsWith('/recipes/')) {
      return src;
    }
    
    // For custom domain, don't add recipes prefix
    if (env.isCustomDomain) {
      return src.startsWith('/') ? src : `/${src}`;
    }
    
    // Add the repository name prefix for absolute paths
    if (src.startsWith('/')) {
      return `${env.basePath}${src}`;
    }
    
    // Add the repository name prefix for relative paths
    return `${env.basePath}/${src}`;
  }, [src]);

  return <img src={fixedSrc} alt={alt} className={className} width={width} height={height} />;
}

// Helper function to fix asset paths for use in client components only
export function getAssetPath(src: string): string {
  // Similar environment-aware logic for path handling
  // ...
}
```

### 2. Updated Navigation Components

Components with hardcoded `/recipes` paths were updated to use `env.basePath`:

- `site-header.tsx` - Updated navigation links
- `site-footer.tsx` - Updated quick links
- `recipe-card.tsx` - Updated recipe detail links

```tsx
// Example from site-header.tsx
<Link href={`${env.basePath}/recipes`} className="text-lg font-semibold hover:text-primary-500 transition-colors">
  All Recipes
</Link>
```

### 3. Improved 404.html Redirect Handling

The 404.html file was updated to detect whether the site is running on GitHub Pages or a custom domain and handle redirects appropriately:

```html
<script>
  // SPA redirect script for GitHub Pages and custom domains
  (function() {
    // Get the hostname and path
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    
    // Determine if we're on GitHub Pages or a custom domain
    // GitHub Pages hostnames follow the pattern: username.github.io
    const isGitHubPages = hostname.includes('github.io');
    
    if (isGitHubPages) {
      // GitHub Pages mode - Need to handle the /recipes/ prefix
      const repoName = pathSegments[1]; // Should be 'recipes'
      
      if (repoName === 'recipes') {
        // Store the path in sessionStorage
        sessionStorage.setItem('redirectPath', path);
        
        // Redirect to the base URL with repository name
        window.location.replace('/' + repoName + '/');
      }
    } else {
      // Custom domain mode - No need for repository prefix
      // Store the path in sessionStorage
      sessionStorage.setItem('redirectPath', path);
      
      // Redirect to the root
      window.location.replace('/');
    }
  })();
</script>
```

### 4. Fixed Client-Side Navigation in layout.tsx

The layout.tsx script was updated to correctly handle redirects based on environment:

```tsx
<Script id="github-pages-spa-navigation" strategy="beforeInteractive">
  {`
    (function() {
      // Check if we have a path stored in sessionStorage from a 404 redirect
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath');
        
        // Determine if we're on GitHub Pages or a custom domain
        const hostname = window.location.hostname;
        const isGitHubPages = hostname.includes('github.io');
        
        // Handle paths differently based on environment
        if (isGitHubPages) {
          // GitHub Pages: need to handle the repository name in the path
          const repoName = '/recipes';
          const relativePath = redirectPath.replace(repoName, '') || '/';
          
          // Store for client-side navigation after hydration
          window.__NEXT_REDIRECT_PATH = relativePath;
        } else {
          // Custom domain: use the path as-is
          window.__NEXT_REDIRECT_PATH = redirectPath;
        }
      }
    })();
  `}
</Script>
```

### 5. Key Benefits of These Changes

- **Consistent Path Handling**: All paths now respect the `env.basePath` setting
- **Environment Detection**: Components can now detect GitHub Pages vs. custom domains
- **Automatic Path Adjustment**: No more hard-coded `/recipes` prefixes causing 404s
- **Improved SPA Navigation**: The 404 redirect system works in both hosting scenarios

These fixes ensure that assets, images, and styles load correctly on both GitHub Pages subdirectory mode and custom domain deployments without requiring separate codebases or complex configurations.

## 18. Fixing ESLint Errors with Path Configuration

When using environment configurations like `env.ts` in components that don't directly reference them, you might encounter ESLint errors related to unused imports. These errors can block the build process for GitHub Pages deployment.

### Problem

The following ESLint error can occur in files that import the environment configuration but don't explicitly use it:

```
./app/layout.tsx
8:10  Error: 'env' is defined but never used.  @typescript-eslint/no-unused-vars
```

This happens because:
1. We need the `env` import for our path handling in client-side scripts
2. ESLint doesn't recognize that it's being used in template literals

### Solution

To fix this issue, add an ESLint directive to disable the specific rule for that import:

```typescript
// In layout.tsx or other files with similar issues
import type { Metadata } from "next";
// ...existing imports...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from "@/lib/env";
```

This tells ESLint to ignore the 'no-unused-vars' rule for the env import only, while still maintaining linting for the rest of the file.

### Usage in Client-Side Scripts

The `env` import may be needed in layout.tsx for SPA navigation scripts:

```typescript
<Script id="github-pages-spa-navigation" strategy="beforeInteractive">
  {`
    (function() {
      // ...existing code...
      
      // Use environment variables in the client-side script
      const isCustomDomain = ${env.isCustomDomain};
      
      // Handle paths differently based on environment
      if (isGitHubPages && !isCustomDomain) {
        // GitHub Pages path handling
        // ...existing code...
      }
    })();
  `}
</Script>
```

This ensures proper path handling in both GitHub Pages and custom domain environments without triggering ESLint errors during the build.

## 19. Troubleshooting Common GitHub Pages Deployment Issues

### ESLint Build Failures

If your build fails with ESLint errors:

1. Check for unused imports flagged by the TypeScript ESLint plugin
2. Use targeted ESLint disable comments like `// eslint-disable-next-line @typescript-eslint/no-unused-vars` for necessary imports
3. Consider using the `ignoreBuildErrors: true` setting in your ESLint configuration if the errors are non-critical

### Asset Path 404 Errors

If you're seeing 404 errors for styles and images:

1. Verify that the `env` configuration is properly imported in all files that handle paths
2. Make sure the `env.basePath` is being used consistently for all asset paths
3. Check that the `fix-gh-pages-paths.js` post-build script is running correctly
4. Inspect network requests in the browser to identify which specific paths are failing
5. Ensure the client-side navigation script in layout.tsx correctly handles environment detection

### Switching Between Deployment Types

When switching between GitHub Pages and custom domain deployments:

1. Always do a clean build (`rm -rf .next out && npm run deploy-gh-pages` or `npm run deploy-custom-domain`)
2. Check the environment variables are set correctly for the desired deployment type
3. Verify the ESLint configuration isn't removing necessary imports for path handling

## 20. Recent Fixes for Custom Domain 404 Errors (May 2025)

A comprehensive set of changes was implemented to fix 404 errors that occurred when accessing images, styles, and supporting files on the custom domain deployment.

### Key Issues Fixed

1. **Asset Path Handling Improvement**
   The `getAssetPath` function in `utils.ts` has been enhanced to properly handle various URL formats and custom domain scenarios:

   ```typescript
   export function getAssetPath(path: string): string {
     // Don't modify URLs that are already absolute or data URLs
     if (path.startsWith('http') || path.startsWith('data:')) {
       return path;
     }
     
     // If path already includes the base path, return as is
     if (env.basePath && path.startsWith(env.basePath)) {
       return path;
     }

     // Handle paths with or without leading slash
     if (path.startsWith('/')) {
       return `${env.basePath}${path}`;
     } else {
       return `${env.basePath}/${path}`;
     }
   }
   ```

2. **Enhanced Environment Variable Handling**
   The `cross-env` package was installed to ensure consistent environment variable setting across platforms:

   ```json
   "deploy-custom-domain": "cross-env USE_CUSTOM_DOMAIN=true npm run build && npm run postbuild-custom-domain && touch out/.nojekyll"
   ```

   This ensures the `USE_CUSTOM_DOMAIN` environment variable is properly set during the build process, which is critical for correct path handling.

3. **Improved Next.js Data Islands Processing**
   The post-build script now includes special handling for Next.js data islands (serialized JSON in HTML):

   ```javascript
   function fixNextDataIslands() {
     // Find all HTML files
     // For each file with __NEXT_DATA__ script tag:
     //   - Parse the JSON data
     //   - Recursively fix paths in the object
     //   - Update paths differently based on custom domain mode
     //   - Write the fixed JSON back to the HTML file
   }
   ```

   This fixes issues where client-side navigation could fail due to incorrect paths in the serialized JSON data.

4. **CNAME File Management**
   Enhanced CNAME file handling to ensure it's properly copied to the output directory:

   ```javascript
   function ensureCnameFile() {
     if (isCustomDomain) {
       // Copy CNAME from root or public directory
       // Provide a warning if not found
     } else if (CNAME exists in output) {
       // Warn about mismatch between build mode and CNAME presence
     }
   }
   ```

5. **Improved 404 Page Redirection**
   The 404.html page was enhanced with more robust environment detection and path handling:

   ```javascript
   // Custom 404 page content for custom domains
   content = `
     <!DOCTYPE html>
     <html>
     <head>
       <meta charset="utf-8">
       <title>Redirecting...</title>
       <script>
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
       </script>
     </head>
     <body>
       <p>Redirecting...</p>
     </body>
     </html>
   `;
   ```

6. **Path Debugging Component**
   Added a debug component that helps diagnose path issues during development:

   ```typescript
   // components/path-debug.tsx
   export default function PathDebug() {
     const [info, setInfo] = useState({
       hostname: '',
       pathname: '',
       isCustomDomain: env.isCustomDomain,
       basePath: env.basePath,
       currentBuild: ''
     });
     
     // ...implementation details...
     
     // Only rendered in development mode
     return (
       <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded shadow-lg text-xs z-50">
         <h4 className="font-bold mb-1">Path Debug</h4>
         <ul className="m-0 p-0 pl-4">
           <li>Hostname: {info.hostname}</li>
           <li>Path: {info.pathname}</li>
           <li>Custom Domain: {String(info.isCustomDomain)}</li>
           <li>Base Path: "{info.basePath}"</li>
           <li>Build: {info.currentBuild}</li>
         </ul>
       </div>
     );
   }
   ```

### Implementation Steps

1. Update utility functions to correctly handle paths in different environments
2. Install cross-env for consistent environment variable handling
3. Enhance the post-build script with improved JSON data processing
4. Add better CNAME file management
5. Create more robust 404 page redirection
6. Implement a debugging component for development use

### How to Deploy with the Fixes

To deploy using the new fixes:

1. **For GitHub Actions (recommended)**:
   - Go to Actions tab in your repository
   - Select "Deploy to GitHub Pages" workflow
   - Choose "custom-domain" from the dropdown
   - Run the workflow

2. **For local deployment**:
   ```bash
   npm run deploy-custom-domain
   # Then push the "out" directory contents to GitHub
   ```

### Verifying the Fix

After deployment, check the following:

1. Ensure all image paths don't include `/recipes/` prefix in HTML source
2. Verify CSS and JavaScript files load correctly (no 404s in Network tab)
3. Check that Next.js data islands in the HTML don't contain incorrect path prefixes
4. Confirm the CNAME file exists in the deployed site

These changes provide a comprehensive solution to the 404 errors on custom domains by ensuring correct path handling throughout the build and deployment process.