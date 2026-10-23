/**
 * Category Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating category forms
 * and server actions.
 *
 * Location: src/lib/validation/category.ts
 * Type: Shared Module
 */

import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must be under 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and dashes",
    ),
  short: z
    .string()
    .trim()
    .min(1, "Short description is required")
    .max(255, "Short description must be under 255 characters"),
  order: z.coerce.number().int().min(0, "Order must be 0 or greater"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
