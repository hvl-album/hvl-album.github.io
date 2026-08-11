import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files, so export the app at build time.
  output: "export",
  // The built-in image optimizer requires a server; GitHub Pages is static.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
