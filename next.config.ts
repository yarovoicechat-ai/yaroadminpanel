import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: '50mb',
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.yaroapp.in',
      },
      {
        protocol: 'https',
        hostname: 'yaroapp.in',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  allowedDevOrigins: [
    'https://danilo-syngamic-unterrifically.ngrok-free.dev'
  ],
  async rewrites() {
    const recruitmentApi = (process.env.RECRUITMENT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://api.yaroapp.in' :
        process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3101')).replace(/\/$/, '');
    return [{
      source: '/api/recruitment/:path*',
      destination: `${recruitmentApi}/api/recruitment/:path*`,
    }];
  },
  async redirects() {
    return [
      {
        source: '/management',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/management/:path*',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
