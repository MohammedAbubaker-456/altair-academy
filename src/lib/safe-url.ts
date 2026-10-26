/**
 * Safe URL & Input Validation Helpers
 *
 * Implements strict allow-lists for user-provided URLs and contact information:
 * - Schemes allowed: https://, http://, mailto:, tel:, and safe relative paths (/ or #).
 * - Explicitly rejects dangerous schemes: javascript:, data:, vbscript:, and protocol-relative links (//).
 * - Phone digits: optional leading '+', 6 to 15 digits.
 * - WhatsApp digits: digits only (no leading '+'), 8 to 15 digits.
 * - Slug format: lowercase alphanumeric words separated by single dashes.
 *
 * Location: src/lib/safe-url.ts
 * Type: Shared Utility Module (Server & Client compatible)
 */

import { z } from "zod";

/**
 * Checks if a URL string uses only approved safe schemes or is a safe relative path.
 */
export function isSafeUrl(rawUrl: unknown): boolean {
  if (typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  // Reject control characters and whitespace tricks
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) return false;

  // Safe relative paths: starts with '/' (but not '//' protocol-relative) or '#'
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  if (trimmed.startsWith("#")) {
    return true;
  }

  // Check scheme
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) {
    // Relative without leading slash, e.g. path/to/page
    // Ensure no control characters or weird syntax
    return !trimmed.includes("\\") && !trimmed.startsWith("//");
  }

  const scheme = trimmed.slice(0, colonIndex).toLowerCase();
  const allowedSchemes = ["http", "https", "mailto", "tel"];

  if (!allowedSchemes.includes(scheme)) {
    return false;
  }

  // Additional sanity check for http/https to require valid host
  if (scheme === "http" || scheme === "https") {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Validates phone digits: optional leading '+', 6-15 digits total.
 * Allows display formatting (spaces, hyphens, parentheses, dots).
 */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  // Optional leading +, then digits, spaces, hyphens, dots, parentheses
  if (!/^\+?[0-9\s\-().]+$/.test(trimmed)) {
    return false;
  }

  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 6 && digitCount <= 15;
}

/**
 * Validates WhatsApp digits: 8 to 15 digits, strictly digits only (no '+', no formatting).
 */
export function isValidWhatsApp(value: string): boolean {
  const trimmed = value.trim();
  return /^[0-9]{8,15}$/.test(trimmed);
}

/**
 * Slug regex: lowercase alphanumeric words separated by single dashes.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_REGEX.test(value.trim());
}

/**
 * Zod Schemas
 */
export const safeUrlSchema = z.string().trim().refine(isSafeUrl, {
  message:
    "URL must be a safe http(s) link or relative path. Schemes like javascript: are prohibited.",
});

export const safeHttpUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
    message: "URL must start with http:// or https://",
  });

export const safePhoneSchema = z.string().trim().refine(isValidPhone, {
  message: "Phone number must contain 6 to 15 digits (optional leading +).",
});

export const safeWhatsAppSchema = z.string().trim().refine(isValidWhatsApp, {
  message: "WhatsApp must contain between 8 and 15 digits with no '+' or symbols.",
});

export const safeSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(120, "Slug must be at most 120 characters")
  .regex(
    SLUG_REGEX,
    "Slug must contain only lowercase letters, numbers, and hyphens (e.g. 'course-name')",
  );
