// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Enhanced basePath and assetPrefix logic - these settings are critical for proper path handling
  // We make sure custom domains always use empty basePath, regardless of other environment conditions
  basePath: (process.env.NODE_ENV === "production" && process.env.USE_CUSTOM_DOMAIN !== "true") ? '/recipes' : '',
  assetPrefix: (process.env.NODE_ENV === "production" && process.env.USE_CUSTOM_DOMAIN !== "true") ? '/recipes/' : '',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Recommended for static hosting
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Add environment variables that will be available during build time
  env: {
    // Make the custom domain setting available to client-side code
    USE_CUSTOM_DOMAIN: process.env.USE_CUSTOM_DOMAIN === 'true' ? 'true' : 'false',
    
    // Export repository name for consistency
    REPOSITORY_NAME: 'recipes',
    
    // Add build timestamp for debugging
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
};

export default nextConfig;