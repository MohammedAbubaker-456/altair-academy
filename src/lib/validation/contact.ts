/**
 * Contact Detail Validation Schema
 *
 * Defines Zod schemas and TypeScript types for validating contact detail forms
 * and administrative server actions with adaptive per-type validation rules.
 *
 * Location: src/lib/validation/contact.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { isSafeUrl, isValidPhone, isValidWhatsApp } from "@/lib/safe-url";

export const contactDetailSchema = z
  .object({
    type: z.enum(["ADDRESS", "PHONE", "WHATSAPP", "EMAIL", "HOURS", "SOCIAL"], {
      errorMap: () => ({ message: "Please select a valid contact type" }),
    }),
    label: z.string().trim().max(120, "Label cannot exceed 120 characters").nullable().optional(),
    value: z
      .string()
      .trim()
      .min(1, "Display value is required")
      .max(300, "Value cannot exceed 300 characters"),
    link: z.string().trim().max(300, "Link cannot exceed 300 characters").nullable().optional(),
    order: z.coerce
      .number()
      .int("Order must be an integer")
      .min(0, "Order cannot be negative")
      .max(9999, "Order cannot exceed 9999"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "EMAIL") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Please enter a valid email address",
        });
      }
    }

    if (data.type === "PHONE") {
      if (data.link && data.link.trim() !== "" && !isValidPhone(data.link)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["link"],
          message: "Phone link must contain 6 to 15 digits for tel: links",
        });
      }
    }

    if (data.type === "WHATSAPP") {
      const digits = (data.link && data.link.trim() !== "" ? data.link : data.value).replace(
        /[\s\-().]/g,
        "",
      );
      if (!isValidWhatsApp(digits)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [data.link && data.link.trim() !== "" ? "link" : "value"],
          message: "WhatsApp digits must contain between 8 and 15 numbers (no leading '+' sign)",
        });
      }
    }

    if (data.type === "SOCIAL") {
      const url = (data.link && data.link.trim() !== "" ? data.link : data.value).trim();
      if (!isSafeUrl(url) || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [data.link && data.link.trim() !== "" ? "link" : "value"],
          message: "Social media links must be a valid http:// or https:// URL",
        });
      }
    }
  });

export type ContactDetailInput = z.infer<typeof contactDetailSchema>;
