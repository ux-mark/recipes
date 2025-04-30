/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  // Disable all features that might not be compatible with static exports
  reactStrictMode: true,
  trailingSlash: true,
  eslint: {
    // Disable eslint during build to avoid issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
