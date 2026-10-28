/**
 * Newsletter Validation Schema
 *
 * Defines Zod validation schemas for newsletter email subscriptions.
 * Validates email addresses (trimmed, lowercased, max 254 chars) while
 * stripping harmful control characters and supporting honeypot protection.
 *
 * Location: src/lib/validation/newsletter.ts
 * Type: Shared Module
 */

import { z } from "zod";

/* eslint-disable no-control-regex */
function stripControlCharacters(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
/* eslint-enable no-control-regex */

export const newsletterSchema = z.object({
  email: z
    .string()
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .max(254, "Email must be under 254 characters")
        .transform((val) => val.toLowerCase()),
    ),
  // Honeypot field (hidden from real users)
  website: z.string().optional().default(""),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
