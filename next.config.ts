import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [],
  },
  trailingSlash: true, // Add trailing slashes for cleaner URLs
  typescript: {
    // This allows production builds to complete successfully
    // even with TypeScript errors
    ignoreBuildErrors: true,
  },
  // Disable powered-by header for improved security
  poweredByHeader: false,
};

export default nextConfig;
