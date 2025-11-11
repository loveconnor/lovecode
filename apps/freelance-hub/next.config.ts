import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "loveui-ai-tools": path.resolve(
        __dirname,
        "../../packages/loveui-ai-tools/src",
      ),
      "loveui-ai-tools/client": path.resolve(
        __dirname,
        "../../packages/loveui-ai-tools/src/client",
      ),
    };
    return config;
  },
};

export default nextConfig;
