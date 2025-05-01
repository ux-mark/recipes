// next.config.mjs - ES module version
/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  // Set basePath if your GitHub Pages site will be served from a subdirectory
  // basePath: '/recipe-website', // Uncomment and replace with your repo name if needed
  images: {
    unoptimized: true, // Required for static export
  },
  // Required for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/recipe-website' : '', // Replace with your repo name
  trailingSlash: true, // Recommended for static hosting
};

export default nextConfig;