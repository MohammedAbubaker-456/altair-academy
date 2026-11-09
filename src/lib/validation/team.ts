/**
 * Team Member Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating team and instructor forms
 * and server actions.
 *
 * Location: src/lib/validation/team.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { optionalSanitizedText } from "./seo";

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and dashes",
    ),
  role: z.string().trim().min(1, "Role is required").max(100),
  shortBio: z.string().trim().min(1, "Short bio is required").max(1000),
  instructorName: z.string().trim().max(100).nullable(),
  instructorRole: z.string().trim().max(100).nullable(),
  fullBio: z.string().trim().max(2000).nullable(),
  expertise: z.array(z.string().trim().min(1)),
  image: z
    .string()
    .trim()
    .refine(
      (val) => val.startsWith("/uploads/") || val.startsWith("/seed/"),
      "Image path must start with '/uploads/' or '/seed/'",
    )
    .nullable(),
  placements: z
    .array(z.enum(["MANAGEMENT", "INSTRUCTOR"]))
    .min(1, "Select at least one placement (Management or Instructor)"),
  managementOrder: z.coerce.number().int().min(0),
  instructorOrder: z.coerce.number().int().min(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  metaTitle: optionalSanitizedText(120, "Meta title cannot exceed 120 characters"),
  metaDescription: optionalSanitizedText(300, "Meta description cannot exceed 300 characters"),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
