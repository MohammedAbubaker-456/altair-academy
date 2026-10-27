/**
 * Course Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating course forms
 * and server actions.
 *
 * Location: src/lib/validation/course.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { isValidObjectId } from "@/lib/id";

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200, "Slug must be under 200 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and dashes",
    ),
  categoryId: z
    .string()
    .trim()
    .refine((val) => isValidObjectId(val), "Please select a valid category"),
  level: z.string().trim().max(50).nullable(),
  duration: z
    .string()
    .trim()
    .min(1, "Duration is required")
    .max(100, "Duration must be under 100 characters"),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .max(100, "Price must be under 100 characters"),
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required")
    .max(1000, "Summary must be under 1000 characters"),
  image: z
    .string()
    .trim()
    .refine(
      (val) => val.startsWith("/uploads/") || val.startsWith("/seed/"),
      "Image path must start with '/uploads/' or '/seed/'",
    )
    .nullable(),
  objective: z
    .string()
    .max(5000, "Course Objective must be under 5,000 characters")
    .optional()
    .nullable(),
  content: z
    .string()
    .max(10000, "Course Content must be under 10,000 characters")
    .optional()
    .nullable(),
  whoShouldAttend: z
    .string()
    .max(5000, "Who Should Attend must be under 5,000 characters")
    .optional()
    .nullable(),
  certification: z
    .string()
    .max(300, "Certification must be under 300 characters")
    .optional()
    .nullable(),
  notesAndEquipment: z
    .string()
    .max(1000, "Course Notes and Equipment must be under 1,000 characters")
    .optional()
    .nullable(),
  classCapacity: z
    .string()
    .max(100, "Class Capacity must be under 100 characters")
    .optional()
    .nullable(),
  feeDetails: z
    .string()
    .max(2000, "Course Fee must be under 2,000 characters")
    .optional()
    .nullable(),
  courseSupport: z
    .string()
    .max(2000, "Course Support must be under 2,000 characters")
    .optional()
    .nullable(),
  isFeatured: z.boolean(),
  order: z.coerce.number().int().min(0, "Order must be 0 or greater"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CourseInput = z.infer<typeof courseSchema>;
