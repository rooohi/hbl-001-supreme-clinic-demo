import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/hbl-001-supreme-clinic-demo",
  assetPrefix: "/hbl-001-supreme-clinic-demo",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

