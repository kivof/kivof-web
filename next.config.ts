import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};
export default nextConfig;
