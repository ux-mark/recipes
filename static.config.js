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
  
  // Routes configuration - simpler and more direct
  routes: [
    // Direct file lookups
    { handle: 'filesystem' },
    
    // SPA fallback - critical for client-side routing
    { src: '.*', dest: '/index.html' }
  ],
  
  // HTTP response headers
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
        }
      ]
    },
    {
      // Cache static assets longer
      source: '/images/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, s-maxage=2592000'
        }
      ]
    }
  ]
};