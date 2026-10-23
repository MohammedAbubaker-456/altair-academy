import type { NextConfig } from "next";

const createNextConfig = (phase: string): NextConfig => {
  process.env["NEXT_PHASE"] = phase;

  return {
    output: "standalone",
    images: {
      localPatterns: [
        {
          pathname: "/uploads/**",
        },
        {
          pathname: "/seed/**",
        },
      ],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: "6mb",
      },
    },
    async headers() {
      return [
        {
          source: "/admin/:path*",
          headers: [
            {
              key: "X-Robots-Tag",
              value: "noindex, nofollow",
            },
          ],
        },
        {
          source: "/seed/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/uploads/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },
  };
};

export default createNextConfig;
