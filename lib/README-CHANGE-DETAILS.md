# Changes for Static Site Deployment to DigitalOcean App Platform

## Overview
The Fairy Bites recipe website has been optimized for deployment as a static site on DigitalOcean's App Platform with CDN support. This document summarizes the key changes made to convert the website from a server-rendered application to a fully static site.

## Key Configuration Changes

1. **Next.js Configuration**
   - Updated `next.config.ts` to use `output: 'export'` for static HTML generation
   - Set `images.unoptimized: true` which is required for static image exports
   - Added trailing slash configuration for cleaner URLs
   - Maintained TypeScript error workaround with `ignoreBuildErrors: true`

2. **Static Site Configuration Files**
   - Created `static.config.js` with recommended caching and routing settings
   - Added `app.yaml` configuration for DigitalOcean App Platform static sites
   - Updated package.json scripts to support the static build workflow

3. **Node.js Version Requirements**
   - Specified Node.js 18.x in package.json's "engines" field
   - Ensures compatibility with Next.js 15.3.1 
   - Provides long-term support for production deployments
   - Optimizes static site generation capabilities
   - Aligns with DigitalOcean App Platform buildpack requirements

4. **Package Dependency Management**
   - Added 'serve' package as a dev dependency for local static site previewing
   - Updated npm scripts to use serve for the static output directory
   - Note: package-lock.json must be kept in sync with package.json before deployment
   - Run `npm install` before deployment to ensure dependency synchronization

## Data Handling Changes

1. **Removed Server-Side Code**
   - Removed 'use server' directive from `lib/recipes.ts`
   - Eliminated file system operations for data loading
   - Removed API routes entirely as they're not compatible with static exports
   - Converted data access to use direct imports from JSON files

2. **Client-Side Data Approach**
   - Changed all data fetching to use direct imports of the recipes.json data
   - Updated components to process data at component initialization instead of API calls
   - Implemented static data-based filtering and sorting

## Component & Page Changes

1. **Static Path Generation**
   - Added `generateStaticParams` function for dynamic routes (`/recipes/[id]`)
   - Created separate `generateStaticParams.ts` file for `/tags/[tag]` route
   - Ensured all dynamic routes are pre-generated at build time

2. **Client vs Server Components**
   - Converted key client components to use static data imports
   - Removed client-side data fetching via useEffect
   - Updated component props and typing for static generation

3. **Image Handling**
   - Decoupled image copying process from the build pipeline
   - Made the copy-images script optional and on-demand
   - Updated image utility to gracefully handle missing source directories

## Deployment Optimizations

1. **CDN & Performance**
   - Added cache control headers configuration in static.config.js
   - Set longer caching times for static assets
   - Configured SPA-style routing for client-side navigation

2. **Build Process**
   - Streamlined the build process by removing automatic image copying
   - Made the build process faster and more reliable
   - Ensured compatibility with DigitalOcean's static site deployment requirements

## Documentation Updates
- Updated README.md with detailed static site deployment instructions
- Added information about the new on-demand image copying process
- Included documentation on CDN benefits and caching strategies

These changes ensure that the website can be deployed as a fully static site that benefits from CDN caching, improved performance, and reduced hosting costs.