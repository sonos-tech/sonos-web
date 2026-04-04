import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_DYNAMIC_ENV_ID: process.env.DYNAMIC_ENV_ID,
    NEXT_PUBLIC_PLATFORM_ETH_ADDRESS: process.env.PLATFORM_ETH_ADDRESS,
  },
};

export default nextConfig;
