import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "img.clerk.com",
      },
      {
        hostname: "ripixitlyiifnrawdhia.supabase.co",
      },
    ],
  },
};

export default nextConfig;
