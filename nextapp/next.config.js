/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the dashboard app under /dashboard while keeping static root pages
  basePath: "/dashboard",
  assetPrefix: "/dashboard",
  images: {
    domains: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static page generation to avoid memory issues
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;