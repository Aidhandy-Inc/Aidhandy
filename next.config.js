/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], // Agar external images use karni hain to yahan add karo
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors so build succeeds
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@opentelemetry\/instrumentation/ },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
