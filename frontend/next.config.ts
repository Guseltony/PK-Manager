import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Only use 'export' for Capacitor builds (which usually run in production mode)
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Custom headers are only supported when NOT using static export
  ...(isProd ? {} : {
    async rewrites() {
      return [
        {
          source: "/local-api/:path*",
          destination: "http://localhost:5000/:path*",
        },
      ];
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin-allow-popups",
            },
            {
              key: "Cross-Origin-Embedder-Policy",
              value: "unsafe-none",
            },
          ],
        },
        {
          source: "/downloads/:path*.apk",
          headers: [
            {
              key: "Content-Type",
              value: "application/vnd.android.package-archive",
            },
            {
              key: "Content-Disposition",
              value: "attachment",
            },
            {
              key: "Cache-Control",
              value: "public, max-age=3600",
            },
          ],
        },
      ];
    },
  }),
};

export default withPWA(nextConfig);
