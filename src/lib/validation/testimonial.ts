/**
 * Testimonial Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating testimonial forms
 * and administrative server actions.
 * Limits: quote 10-600; name 2-100; company optional max 120; order 0-9999; status ACTIVE/INACTIVE.
 *
 * Location: src/lib/validation/testimonial.ts
 * Type: Shared Module
 */

import { z } from "zod";

/* eslint-disable no-control-regex */
function stripControlCharacters(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
/* eslint-enable no-control-regex */

export const testimonialSchema = z.object({
  quote: z
    .string({ required_error: "Quote is required" })
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .min(10, "Quote must be at least 10 characters")
        .max(600, "Quote cannot exceed 600 characters"),
    ),
  name: z
    .string({ required_error: "Name is required" })
    .transform(stripControlCharacters)
    .pipe(
      z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    ),
  company: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const cleaned = stripControlCharacters(val).trim();
      return cleaned.length > 0 ? cleaned : null;
    })
    .pipe(
      z
        .string()
        .max(120, "Company name cannot exceed 120 characters")
        .nullable(),
    ),
  order: z.coerce
    .number({ required_error: "Display order is required" })
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .max(9999, "Order cannot exceed 9999"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
