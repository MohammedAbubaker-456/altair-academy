/**
 * Shared Legal Page Helpers
 *
 * Provides URL mapping and client-compatible utilities for legal documents.
 *
 * Location: src/lib/legal.ts
 * Type: Shared Module (Client and Server compatible)
 */

/**
 * Returns canonical public path for a legal page slug.
 * Core slugs "privacy" and "terms" map directly to their root routes.
 * Custom legal slugs map to "/legal/<slug>".
 */
export function legalHref(slug: string): string {
  if (slug === "privacy") return "/privacy";
  if (slug === "terms") return "/terms";
  return `/legal/${slug}`;
}
