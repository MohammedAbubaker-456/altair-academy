/**
 * Career Application Validation Schema
 *
 * Defines Zod validation schemas for instructor and employment candidate applications.
 * Validates candidate names, emails, international phone digits, specialisations,
 * and optional cover notes while stripping control characters.
 *
 * Location: src/lib/validation/application.ts
 * Type: Shared Module
 */

import { z } from "zod";

function stripControlCharacters(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function isValidPhone(phone: string): boolean {
  const stripped = phone.replace(/[\s\-\(\)\.]/g, "");
  const digits = stripped.startsWith("+") ? stripped.slice(1) : stripped;
  return /^\d{6,15}$/.test(digits);
}

export const applicationSchema = z.object({
  name: z
    .string()
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters"),
    ),
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
  phone: z
    .string()
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .max(30, "Phone number is too long")
        .refine(isValidPhone, "Phone number must contain between 6 and 15 digits"),
    ),
  specialisation: z
    .string()
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .max(100, "Specialisation must be under 100 characters")
        .optional()
        .nullable(),
    )
    .optional()
    .nullable(),
  message: z
    .string()
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .max(2000, "Message must be under 2,000 characters")
        .optional()
        .nullable(),
    )
    .optional()
    .nullable(),
  // Honeypot field (hidden from real users)
  website: z.string().optional().default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
