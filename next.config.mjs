// next.config.mjs - ES module version
/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  // Set basePath for GitHub Pages repository
  basePath: process.env.NODE_ENV === 'production' ? '/recipe-website' : '',
  images: {
    unoptimized: true, // Required for static export
  },
  // Required for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/recipe-website' : '',
  trailingSlash: true, // Recommended for static hosting
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;