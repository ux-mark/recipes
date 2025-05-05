/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    // Add explicit configuration for allowed dev origins to fix cross-origin warning
    allowedDevOrigins: [
      '192.168.8.60',
      'localhost',
    ],
  },
  // Use the correct property name as mentioned in the warning
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

export default nextConfig;