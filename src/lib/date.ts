/**
 * Shared Date Formatting Module
 *
 * Provides deterministic timezone and locale-aware date/time formatting
 * for administrative tables and detail views, preventing SSR/client hydration mismatches.
 *
 * Location: src/lib/date.ts
 * Type: Shared Module
 */

export const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";
export const TIMEZONE_LABEL = "MYT (UTC+8)";

/**
 * Formats a timestamp into a full readable date and time string.
 * Example: "27 Oct 2026, 16:45:00"
 */
export function formatDateTime(
  date: Date | string | number,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-MY", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * Formats a timestamp into a short date string.
 * Example: "27 Oct 2026"
 */
export function formatDateShort(
  date: Date | string | number,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-MY", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
