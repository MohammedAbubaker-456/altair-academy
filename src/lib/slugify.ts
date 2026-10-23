/**
 * URL Slug Generator
 *
 * Converts arbitrary text into URL-friendly lowercase slugs.
 *
 * Location: src/lib/slugify.ts
 * Type: Shared Utility
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
