import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    lockDistDir: false,
  },
};

export default nextConfig;
