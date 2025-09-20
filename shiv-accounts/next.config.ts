import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Disable image optimization to ensure local images work
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
