/**
 * FAQ Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating FAQ forms
 * and server actions.
 *
 * Location: src/lib/validation/faq.ts
 * Type: Shared Module
 */

import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
  order: z.coerce.number().int().min(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type FaqInput = z.infer<typeof faqSchema>;
