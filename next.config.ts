import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Optimizes for containerized environments
  poweredByHeader: false,
  reactStrictMode: true,
  distDir: '.next', // Explicitly set the build output directory
  images: {
    domains: ['assets.digitalocean.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // This helps with deployment on DigitalOcean
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable the XHR polling, which can cause issues in DigitalOcean
  experimental: {
    scrollRestoration: true,
  },
  generateBuildId: async () => {
    // Use a timestamp-based build ID for better debugging
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
