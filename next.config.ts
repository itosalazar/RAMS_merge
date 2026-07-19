import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The project lives on a network volume; macOS AppleDouble (._*) files
    // corrupt Turbopack's on-disk cache database. Keep the cache in memory.
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
