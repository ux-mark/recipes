/**
 * Digital Ocean Static Site Configuration
 * This file documents the configuration for deploying to Digital Ocean App Platform as a static site
 */

module.exports = {
  // Output directory for the static export
  outputDirectory: 'out',
  
  // Root directory to serve (relative to the repo root)
  rootDirectory: 'out',
  
  // Build command for Digital Ocean App Platform - using our custom script
  buildCommand: 'npm run deploy-build',
  
  // Routes configuration - improved for SPA navigation
  routes: [
    // Direct file lookups first
    { handle: 'filesystem' },
    
    // SPA fallback - critical for client-side routing
    // Using index.html instead of 200.html for better compatibility
    { src: '.*', dest: '/index.html' }
  ],
  
  // HTTP response headers - improved caching strategy
  headers: [
    {
      // Apply to all routes
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ]
    },
    {
      // Cache static assets longer - improved for images
      source: '/images/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, s-maxage=2592000, immutable'
        }
      ]
    },
    {
      // Cache JS/CSS assets
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
};