/**
 * Subcategory Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating subcategory forms
 * and server actions.
 *
 * Location: src/lib/validation/subcategory.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { isValidObjectId } from "@/lib/id";

export const subcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must be under 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and dashes",
    ),
  parentId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (val) => !val || isValidObjectId(val),
      "Please select a valid parent subcategory",
    ),
  order: z.coerce
    .number()
    .int("Order must be an integer")
    .min(0, "Order must be 0 or greater")
    .max(9999, "Order must be 9999 or less"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type SubcategoryInput = z.infer<typeof subcategorySchema>;
