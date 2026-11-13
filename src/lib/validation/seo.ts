/**
 * SEO Validation Schemas
 *
 * Defines Zod schemas and TypeScript types for validating:
 * 1. PageSeo overrides (per pageKey)
 * 2. SiteSeo defaults (singleton)
 * 3. Record-level SEO fields (courses, news, team, legal)
 *
 * Location: src/lib/validation/seo.ts
 * Type: Shared Module
 */

import { z } from "zod";
import { isRegistryKey, getRegistryItem } from "@/lib/seo/registry";

/* eslint-disable no-control-regex */
export function stripControlCharacters(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
/* eslint-enable no-control-regex */

/**
 * Sanitizes and normalizes optional text fields.
 * Trims input, strips control characters, and converts empty strings to null.
 */
export function optionalSanitizedText(maxLength: number, message: string) {
  return z.string().trim().max(maxLength, message).nullable().optional();
}

/**
 * Sanitizes and validates image path (must start with /uploads/ or /seed/, or be null)
 */
export const optionalImagePath = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith("/uploads/") || val.startsWith("/seed/"),
    "Image path must start with '/uploads/' or '/seed/'",
  )
  .nullable()
  .optional();

/**
 * Sanitizes and validates canonical relative path
 * Must start with single '/', max 200 chars.
 */
export const optionalCanonicalPath = z
  .string()
  .trim()
  .max(200, "Canonical path cannot exceed 200 characters")
  .refine(
    (val) => !val || (val.startsWith("/") && !val.startsWith("//")),
    "Canonical path must be a relative path starting with a single '/' (e.g. /courses)",
  )
  .nullable()
  .optional();

/**
 * Validates optional Twitter handle
 */
export const optionalTwitterHandle = z
  .string()
  .trim()
  .refine(
    (val) => !val || /^@[A-Za-z0-9_]{1,15}$/.test(val),
    "Twitter handle must be in the format @handle (up to 15 characters)",
  )
  .nullable()
  .optional();

/**
 * Helper to check and validate placeholders in a text string
 */
function validateFieldPlaceholders(
  val: string | null | undefined,
  pageKey: string,
  field: string,
  ctx: z.RefinementCtx,
) {
  if (!val) return;
  const item = getRegistryItem(pageKey);
  const matches = val.match(/\{([a-zA-Z0-9_-]+)\}/g);
  if (!matches) return;

  const allowed = item?.allowedPlaceholders ?? [];
  for (const match of matches) {
    if (!allowed.includes(match)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: item?.isTemplate
          ? `Invalid placeholder "${match}". Allowed placeholders for this template: ${allowed.join(", ") || "none"}`
          : `Placeholders like "${match}" are only allowed on detail page templates, not static pages.`,
        path: [field],
      });
    }
  }
}

/**
 * Page SEO schema for admin edit form
 */
export const pageSeoSchema = z
  .object({
    pageKey: z
      .string()
      .trim()
      .min(1, "Page key is required")
      .refine(isRegistryKey, "Invalid page key"),
    title: z.string().trim().max(120, "Title cannot exceed 120 characters").nullable().optional(),
    description: z
      .string()
      .trim()
      .max(300, "Description cannot exceed 300 characters")
      .nullable()
      .optional(),
    ogTitle: z
      .string()
      .trim()
      .max(120, "OG Title cannot exceed 120 characters")
      .nullable()
      .optional(),
    ogDescription: z
      .string()
      .trim()
      .max(300, "OG Description cannot exceed 300 characters")
      .nullable()
      .optional(),
    ogImage: optionalImagePath,
    canonicalPath: optionalCanonicalPath,
    noIndex: z.boolean().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    validateFieldPlaceholders(data.title, data.pageKey, "title", ctx);
    validateFieldPlaceholders(data.description, data.pageKey, "description", ctx);
    validateFieldPlaceholders(data.ogTitle, data.pageKey, "ogTitle", ctx);
    validateFieldPlaceholders(data.ogDescription, data.pageKey, "ogDescription", ctx);
  });

export type PageSeoInput = z.infer<typeof pageSeoSchema>;

/**
 * Returns true if all override fields are null/empty/undefined
 */
export function isPageSeoEmpty(data: PageSeoInput): boolean {
  return (
    !data.title &&
    !data.description &&
    !data.ogTitle &&
    !data.ogDescription &&
    !data.ogImage &&
    !data.canonicalPath &&
    (data.noIndex === null || data.noIndex === undefined)
  );
}

/**
 * Site SEO defaults schema
 */
export const siteSeoSchema = z.object({
  siteName: optionalSanitizedText(80, "Site name cannot exceed 80 characters"),
  defaultDescription: optionalSanitizedText(
    300,
    "Default description cannot exceed 300 characters",
  ),
  defaultOgImage: optionalImagePath,
  twitterSite: optionalTwitterHandle,
});

export type SiteSeoInput = z.infer<typeof siteSeoSchema>;

/**
 * Returns true if all SiteSeo fields are null/empty/undefined
 */
export function isSiteSeoEmpty(data: SiteSeoInput): boolean {
  return !data.siteName && !data.defaultDescription && !data.defaultOgImage && !data.twitterSite;
}
