/**
 * Careers / Job Opening Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating job opening forms
 * and administrative server actions.
 * Limits: title, location, scope <= 120; summary <= 600; order 0..9999.
 *
 * Location: src/lib/validation/careers.ts
 * Type: Shared Module
 */

import { z } from "zod";

export const jobOpeningSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(120, "Title must be at most 120 characters"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"], {
    errorMap: () => ({ message: "Please select a valid employment type" }),
  }),
  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(120, "Location must be at most 120 characters"),
  scope: z
    .string()
    .trim()
    .min(1, "Method or department scope is required")
    .max(120, "Scope must be at most 120 characters"),
  summary: z
    .string()
    .trim()
    .min(1, "Job summary is required")
    .max(600, "Summary must be at most 600 characters"),
  order: z.coerce
    .number()
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .max(9999, "Order cannot exceed 9999"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type JobOpeningInput = z.infer<typeof jobOpeningSchema>;
