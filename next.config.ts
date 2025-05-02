import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [], // Add any external image domains here if needed
    unoptimized: false, // Set to true if you want to disable Next.js image optimization
  },
  // Enable this to bypass TypeScript errors during production builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
