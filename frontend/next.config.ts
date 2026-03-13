import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "http",
  //       hostname: "31.97.115.181",
  //       port: "8081",
  //       pathname: "/uploads/**",
  //     },
  //   ],
  // },
  images: {
    remotePatterns: [
      {
        protocol: (process.env.NEXT_PUBLIC_IMAGE_PROTOCOL as "http" | "https") || "http",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST || "localhost",
        port: process.env.NEXT_PUBLIC_IMAGE_PORT
          ? process.env.NEXT_PUBLIC_IMAGE_PORT
          : undefined, // must be number or undefined
        pathname: "/uploads/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@common": path.resolve(__dirname, "../common"),
    },
  },
};

export default nextConfig;
