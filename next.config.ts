import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Transformers.js runs only in server API routes — exclude from client bundle
  serverExternalPackages: ['@xenova/transformers'],
  // Empty turbopack config to suppress webpack config warning
  turbopack: {},
};

export default nextConfig;
