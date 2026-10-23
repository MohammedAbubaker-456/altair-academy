/**
 * News Post Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating news post forms
 * and server actions.
 *
 * Location: src/lib/validation/news.ts
 * Type: Shared Module
 */

import { z } from "zod";

export const newsPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and dashes",
    ),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(1000),
  kind: z.enum(["FEATURED", "STORY", "PICK"]),
  category: z.string().trim().max(100).nullable(),
  tags: z.array(z.string().trim().min(1)),
  image: z
    .string()
    .trim()
    .refine(
      (val) => val.startsWith("/uploads/") || val.startsWith("/seed/"),
      "Image path must start with '/uploads/' or '/seed/'",
    )
    .nullable(),
  publishedAt: z.coerce.date(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type NewsPostInput = z.infer<typeof newsPostSchema>;
