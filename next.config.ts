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
    // serverActions option removed as it's causing an error
  },
  generateBuildId: async () => {
    // Use a timestamp-based build ID for better debugging
    return `build-${Date.now()}`;
  },
  // Configure trailingSlash for better compatibility with static hosting
  trailingSlash: true,
};

export default nextConfig;
