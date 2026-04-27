import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  experimental: {
    lockDistDir: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "avatars.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
      },
    ],
  },
};

export default nextConfig;
