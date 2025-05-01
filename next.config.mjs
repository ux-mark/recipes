// @ts-check

/** @type {import('next').NextConfig} */
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

export default nextConfig;