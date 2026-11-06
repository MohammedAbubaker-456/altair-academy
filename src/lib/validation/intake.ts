/**
 * Upcoming Intake Validation Schema
 *
 * Defines Zod validation schemas and TypeScript types for home page upcoming intakes.
 * Limits: title 3-120; location 2-120; points 0-5 items (each 3-100 chars); order 0-9999;
 * startDate/endDate real calendar dates (YYYY-MM-DD), year 2000-2100, end >= start, span <= 31 days.
 *
 * Location: src/lib/validation/intake.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { isValidCalendarDate, getDaysSpan } from "./calendar";

/* eslint-disable no-control-regex */
function stripControlCharacters(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
/* eslint-enable no-control-regex */

export const upcomingIntakeSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required" })
      .transform(stripControlCharacters)
      .pipe(
        z
          .string()
          .trim()
          .min(3, "Title must be at least 3 characters")
          .max(120, "Title cannot exceed 120 characters"),
      ),
    startDate: z
      .string({ required_error: "Start date is required" })
      .trim()
      .refine(isValidCalendarDate, "Please enter a valid start date (YYYY-MM-DD)"),
    endDate: z
      .string()
      .optional()
      .nullable()
      .transform((val) => {
        if (!val) return undefined;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      }),
    location: z
      .string({ required_error: "Location is required" })
      .transform(stripControlCharacters)
      .pipe(
        z
          .string()
          .trim()
          .min(2, "Location must be at least 2 characters")
          .max(120, "Location cannot exceed 120 characters"),
      ),
    points: z
      .array(z.string())
      .default([])
      .transform((items) => {
        const cleaned = items
          .map((p) => stripControlCharacters(p).trim())
          .filter((p) => p.length > 0);
        return Array.from(new Set(cleaned));
      })
      .pipe(
        z
          .array(
            z
              .string()
              .min(3, "Point must be at least 3 characters")
              .max(100, "Point cannot exceed 100 characters"),
          )
          .max(5, "At most 5 bullet points are allowed"),
      ),
    order: z.coerce
      .number({ required_error: "Display order is required" })
      .int("Order must be an integer")
      .min(0, "Order cannot be negative")
      .max(9999, "Order cannot exceed 9999"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
      errorMap: () => ({ message: "Please select a valid status" }),
    }),
  })
  .transform((data) => {
    return {
      ...data,
      endDate: data.endDate || data.startDate,
    };
  })
  .superRefine((data, ctx) => {
    if (!isValidCalendarDate(data.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Please enter a valid end date (YYYY-MM-DD)",
      });
      return;
    }

    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be earlier than start date",
      });
      return;
    }

    const span = getDaysSpan(data.startDate, data.endDate);
    if (span > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Intake duration cannot exceed 31 days",
      });
    }
  });

export const intakeSchema = upcomingIntakeSchema;
export type UpcomingIntakeInput = z.output<typeof upcomingIntakeSchema>;
export type UpcomingIntakeFormValues = z.input<typeof upcomingIntakeSchema>;

