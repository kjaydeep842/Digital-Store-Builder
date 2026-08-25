import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.36', 'localhost', '127.0.0.1'],
  experimental: {
    // optional options
  }
};

export default nextConfig;
