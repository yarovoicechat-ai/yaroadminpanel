import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.voicecallclub.com',
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
