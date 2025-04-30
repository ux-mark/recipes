/**
 * Digital Ocean Static Site Configuration
 * This file documents the configuration for deploying to Digital Ocean App Platform as a static site
 */

module.exports = {
  // Output directory for the static export
  outputDirectory: 'out',
  
  // Root directory to serve (relative to the repo root)
  rootDirectory: 'out',
  
  // Build command for Digital Ocean App Platform
  buildCommand: 'npm run build',
  
  // Routes configuration
  routes: [
    // Handle client-side routing for Next.js app
    { handle: 'filesystem' },
    // Fallback to index.html for client-side routing
    { src: '/(.*)', dest: '/index.html' }
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
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
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