import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Optimizes for containerized environments
  poweredByHeader: false,
  reactStrictMode: true,
  distDir: '.next', // Explicitly set the build output directory
  images: {
    domains: ['assets.digitalocean.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Let Digital Ocean know this is a server app, not a static site
  experimental: {
    serverComponentsExternalPackages: [],
  },
  typescript: {
    // Allow production builds to complete despite TypeScript errors
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => {
    // Use a timestamp-based build ID for better debugging
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
