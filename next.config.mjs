// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Use empty basePath and assetPrefix when USE_CUSTOM_DOMAIN=true
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
};

export default nextConfig;