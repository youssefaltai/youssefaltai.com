import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Optimize for Docker builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Monorepo configuration
  transpilePackages: ['@repo/ui', '@repo/utils', '@repo/auth'],
  // Explicit workspace root for Turbopack (Next.js 15+ syntax)
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
