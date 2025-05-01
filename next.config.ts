import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [],
    domains: [], // Add if you have external image domains
  },
  trailingSlash: true, // Add trailing slashes for cleaner URLs
  typescript: {
    // This allows production builds to complete successfully
    // even with TypeScript errors
    ignoreBuildErrors: true,
  },
  // Disable powered-by header for improved security
  poweredByHeader: false,
  // Experimental features to improve static export
  experimental: {
    // Improves CSS handling in static export
    optimizeCss: true,
    // Turbopack is not fully compatible with static export
    // so we disable it for production builds
    turbotrace: false,
  },
  // Configure redirects for SPA fallbacks
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/404.html',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
