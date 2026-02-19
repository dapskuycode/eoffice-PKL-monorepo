import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/e-office-storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/e-office-storage/**',
      },
    ],
    // Disable private IP blocking for development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Allow localhost images
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
