// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Use empty basePath and assetPrefix when USE_CUSTOM_DOMAIN=true
  // The basePath might be overridden by GitHub Actions, so we add a safeguard
  basePath: (process.env.NODE_ENV === "production" && process.env.USE_CUSTOM_DOMAIN !== "true" && !process.env.GITHUB_ACTIONS) ? '/recipes' : '',
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