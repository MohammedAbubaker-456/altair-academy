/**
 * Dynamic robots.txt Configuration
 *
 * Configures search engine indexing rules, ensuring the admin dashboard
 * is explicitly excluded from web crawlers.
 *
 * Location: src/app/robots.ts
 * Type: Server-Only Metadata Route
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin"],
    },
  };
}
