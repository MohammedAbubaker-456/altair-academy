/**
 * Legal Page Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating custom and core legal pages.
 * Limits: title <= 200, slug <= 120, metaDescription <= 200, body <= 50,000, order 0..9999.
 *
 * Location: src/lib/validation/legal.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { safeSlugSchema } from "@/lib/safe-url";
import { optionalSanitizedText } from "./seo";

export const legalPageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  slug: safeSlugSchema,
  metaTitle: optionalSanitizedText(120, "Meta title cannot exceed 120 characters"),
  metaDescription: z
    .string()
    .trim()
    .max(200, "Meta description must be at most 200 characters")
    .nullable()
    .optional(),
  body: z
    .string()
    .min(1, "Body content is required")
    .max(50000, "Body must not exceed 50,000 characters"),
  showInFooter: z.boolean(),
  order: z.coerce
    .number()
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .max(9999, "Order cannot exceed 9999"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type LegalPageInput = z.infer<typeof legalPageSchema>;
