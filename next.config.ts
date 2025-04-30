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
  },
  generateBuildId: async () => {
    // Use a timestamp-based build ID for better debugging
    return `build-${Date.now()}`;
  },
  // Configure trailingSlash for better compatibility with static hosting
  trailingSlash: true,
  // Ensure all our routes are properly included in the static export
  exportPathMap: async function() {
    // This is where you'd list all your static paths
    // But for Digital Ocean's static hosting with catchall fallback,
    // we only need to specify the core routes
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
    };
  },
};

export default nextConfig;
