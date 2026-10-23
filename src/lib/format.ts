/**
 * Date and Text Formatting Utilities
 *
 * Provides deterministic date formatting using Intl en-GB with UTC timezone
 * to prevent server/client hydration mismatches across different user timezones.
 *
 * Location: src/lib/format.ts
 * Type: Shared Utility Module (Server & Client compatible)
 */

const newsDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Format a Date or date string to standard display format e.g. "18 August 2026"
 */
export function formatNewsDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return newsDateFormatter.format(d);
}
