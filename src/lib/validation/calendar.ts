/**
 * Calendar Validation Schemas
 *
 * Defines Zod schemas and TypeScript types for validating calendar courses
 * and training/exam sessions for both forms and server actions.
 *
 * Location: src/lib/validation/calendar.ts
 * Type: Shared Validation Module
 */

import { z } from "zod";

export function isValidCalendarDate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const parts = str.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return false;
  if (y < 2000 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function getDaysSpan(startStr: string, endStr: string): number {
  const parts1 = startStr.split("-").map(Number);
  const parts2 = endStr.split("-").map(Number);
  const t1 = Date.UTC(parts1[0]!, parts1[1]! - 1, parts1[2]!);
  const t2 = Date.UTC(parts2[0]!, parts2[1]! - 1, parts2[2]!);
  const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export const calendarCourseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Course code must be between 2 and 12 characters")
    .max(12, "Course code must be between 2 and 12 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Course code may only contain letters, digits, and hyphens")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(100, "Course name must be at most 100 characters"),
  order: z.coerce
    .number()
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .max(9999, "Order cannot exceed 9999"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CalendarCourseInput = z.infer<typeof calendarCourseSchema>;

export const calendarSessionSchema = z
  .object({
    courseId: z
      .string()
      .trim()
      .min(1, "Please select a course")
      .refine((id) => /^[a-f0-9]{24}$/i.test(id), "Invalid course selection"),
    kind: z.enum(["TRAINING", "EXAM"], {
      errorMap: () => ({ message: "Please select either Training or Examination" }),
    }),
    level: z
      .string()
      .trim()
      .max(40, "Level must be at most 40 characters")
      .optional()
      .nullable(),
    startDate: z
      .string()
      .trim()
      .min(1, "Start date is required")
      .refine(
        isValidCalendarDate,
        "Start date must be a real calendar date (YYYY-MM-DD) between 2000 and 2100",
      ),
    endDate: z
      .string()
      .trim()
      .min(1, "End date is required")
      .refine(
        isValidCalendarDate,
        "End date must be a real calendar date (YYYY-MM-DD) between 2000 and 2100",
      ),
    timeLabel: z
      .string()
      .trim()
      .max(40, "Time label must be at most 40 characters")
      .optional()
      .nullable(),
    location: z
      .string()
      .trim()
      .max(120, "Location must be at most 120 characters")
      .optional()
      .nullable(),
    note: z
      .string()
      .trim()
      .max(300, "Note must be at most 300 characters")
      .optional()
      .nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .superRefine((data, ctx) => {
    if (isValidCalendarDate(data.startDate) && isValidCalendarDate(data.endDate)) {
      if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be on or after start date",
        });
      } else {
        const span = getDaysSpan(data.startDate, data.endDate);
        if (span > 31) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: `Session span cannot exceed 31 days (current span is ${span} days)`,
          });
        }
      }
    }
  });

export type CalendarSessionInput = z.infer<typeof calendarSessionSchema>;
