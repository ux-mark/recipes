import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Optimizes the output for containerized environments
  poweredByHeader: false, // Removes X-Powered-By header for security
  reactStrictMode: true,
  images: {
    domains: ['assets.digitalocean.com'], // Add any external image domains
    formats: ['image/avif', 'image/webp'],
  },
  // Disable TypeScript checking during production builds
  // typescript: {
  //   // !! WARN !!
  //   // This allows production builds to successfully complete even if
  //   // your project has TypeScript errors.
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
