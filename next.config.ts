import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Changed to 'export' for static site generation
  poweredByHeader: false,
  reactStrictMode: true,
  distDir: '.next', // Build directory
  images: {
    domains: ['assets.digitalocean.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Required for static exports
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    scrollRestoration: true,
    serverActions: false, // Explicitly disable server actions
  },
  generateBuildId: async () => {
    // Use a timestamp-based build ID for better debugging
    return `build-${Date.now()}`;
  },
  // Configure trailingSlash for better compatibility with static hosting
  trailingSlash: true,
  // Note: exportPathMap is removed because it's not compatible with the app directory
};

export default nextConfig;
