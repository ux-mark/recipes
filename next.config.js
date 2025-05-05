/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    // Remove unrecognized allowedDevOrigins option
  },
  // Move serverExternalPackages out of experimental
  serverExternalPackages: [],
  reactStrictMode: true,
  poweredByHeader: false,
  // Configure for better middleware handling
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'x-middleware-preflight',
            value: '1',
          },
        ],
      },
    ];
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Use ES module export syntax instead of CommonJS
export default nextConfig;
