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

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a date-only "YYYY-MM-DD" string into a short date without Date object timezone shifts.
 * Example: "2026-01-12" -> "12 Jan 2026"
 */
export function formatDateOnly(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return "—";
  const parts = dateStr.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d || m < 1 || m > 12) return dateStr;
  const monthName = MONTH_SHORT_NAMES[m - 1] ?? "";
  return `${d} ${monthName} ${y}`;
}

/**
 * Formats a date range from two date-only "YYYY-MM-DD" strings without Date object timezone shifts.
 * Examples:
 * - "2026-01-12", "2026-01-16" -> "12–16 Jan 2026"
 * - "2026-01-17", "2026-01-17" -> "17 Jan 2026"
 * - "2026-01-28", "2026-02-02" -> "28 Jan – 2 Feb 2026"
 * - "2026-12-28", "2027-01-02" -> "28 Dec 2026 – 2 Jan 2027"
 */
export function formatDateOnlyRange(startStr: string, endStr: string): string {
  if (!startStr) return "—";
  if (!endStr || startStr === endStr) {
    return formatDateOnly(startStr);
  }

  const sParts = startStr.split("-").map(Number);
  const eParts = endStr.split("-").map(Number);
  const sY = sParts[0];
  const sM = sParts[1];
  const sD = sParts[2];
  const eY = eParts[0];
  const eM = eParts[1];
  const eD = eParts[2];

  if (!sY || !sM || !sD || !eY || !eM || !eD || sM < 1 || sM > 12 || eM < 1 || eM > 12) {
    return `${startStr} – ${endStr}`;
  }

  const sMonth = MONTH_SHORT_NAMES[sM - 1];
  const eMonth = MONTH_SHORT_NAMES[eM - 1];

  // Same day
  if (sY === eY && sM === eM && sD === eD) {
    return `${sD} ${sMonth} ${sY}`;
  }

  // Same month, same year: "12–16 Jan 2026"
  if (sY === eY && sM === eM) {
    return `${sD}–${eD} ${sMonth} ${sY}`;
  }

  // Different month, same year: "28 Jan – 2 Feb 2026"
  if (sY === eY) {
    return `${sD} ${sMonth} – ${eD} ${eMonth} ${sY}`;
  }

  // Different years
  return `${sD} ${sMonth} ${sY} – ${eD} ${eMonth} ${eY}`;
}

/**
 * Returns today's date formatted as "YYYY-MM-DD" in the specified timezone (default Asia/Kuala_Lumpur).
 */
export function getTodayDateString(timeZone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}
