/**
 * Admin SEO Server Actions
 *
 * Implements CRUD operations, singleton site SEO management, and cache revalidation
 * for public page meta tags and detail page templates.
 *
 * Location: src/app/admin/seo/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import {
  pageSeoSchema,
  siteSeoSchema,
  isPageSeoEmpty,
  isSiteSeoEmpty,
  stripControlCharacters,
} from "@/lib/validation/seo";
import { isRegistryKey } from "@/lib/seo/registry";

export type SeoActionResult = {
  ok: boolean;
  success: boolean;
  message: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const cleanString = (val?: string | null) => {
  if (!val) return null;
  const stripped = stripControlCharacters(val).trim();
  return stripped.length > 0 ? stripped : null;
};

function triggerSeoRevalidation(pageKey?: string) {
  try {
    revalidatePath("/admin");
    revalidatePath("/admin/seo");
    if (pageKey) {
      revalidatePath(`/admin/seo/${pageKey}`);
    }
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn(
      "[SEO Actions] Revalidation notice:",
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Saves customized SEO overrides for a specific pageKey.
 * If all override fields are cleared, the row is automatically deleted
 * to keep the database lean and fully default-driven.
 */
export async function savePageSeo(
  pageKey: string,
  input: unknown,
): Promise<SeoActionResult> {
  await requireAdmin();

  if (!pageKey || !isRegistryKey(pageKey)) {
    return {
      ok: false,
      success: false,
      message: `Invalid page key: "${pageKey}"`,
      error: `Invalid page key: "${pageKey}"`,
    };
  }

  const rawData =
    typeof input === "object" && input !== null ? { ...input, pageKey } : { pageKey };

  const parseResult = pageSeoSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(
      ([_, errs]) => errs && errs.length > 0,
    );
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return {
      ok: false,
      success: false,
      message,
      error: message,
      fieldErrors,
    };
  }

  const validatedData = parseResult.data;

  try {
    // If all fields are empty, remove any existing override row
    if (isPageSeoEmpty(validatedData)) {
      await db.pageSeo.deleteMany({
        where: { pageKey },
      });
      triggerSeoRevalidation(pageKey);
      return {
        ok: true,
        success: true,
        message: "Overrides cleared. Page will use baseline defaults.",
      };
    }

    const cleanedData = {
      title: cleanString(validatedData.title),
      description: cleanString(validatedData.description),
      ogTitle: cleanString(validatedData.ogTitle),
      ogDescription: cleanString(validatedData.ogDescription),
      ogImage: cleanString(validatedData.ogImage),
      canonicalPath: cleanString(validatedData.canonicalPath),
      noIndex: typeof validatedData.noIndex === "boolean" ? validatedData.noIndex : null,
    };

    await db.pageSeo.upsert({
      where: { pageKey },
      create: {
        pageKey,
        ...cleanedData,
      },
      update: cleanedData,
    });

    triggerSeoRevalidation(pageKey);
    return {
      ok: true,
      success: true,
      message: "Page SEO settings saved successfully.",
    };
  } catch (error) {
    console.error(
      `[SEO Actions] Failed to save PageSeo for "${pageKey}":`,
      error,
    );
    return {
      ok: false,
      success: false,
      message: "Database error: failed to save page SEO settings.",
      error: "Database error: failed to save page SEO settings.",
    };
  }
}

/**
 * Resets a page's SEO overrides back to registry defaults by deleting its PageSeo row.
 */
export async function resetPageSeo(pageKey: string): Promise<SeoActionResult> {
  await requireAdmin();

  if (!pageKey || !isRegistryKey(pageKey)) {
    return {
      ok: false,
      success: false,
      message: `Invalid page key: "${pageKey}"`,
      error: `Invalid page key: "${pageKey}"`,
    };
  }

  try {
    await db.pageSeo.deleteMany({
      where: { pageKey },
    });
    triggerSeoRevalidation(pageKey);
    return {
      ok: true,
      success: true,
      message: "Page SEO reset to baseline defaults.",
    };
  } catch (error) {
    console.error(
      `[SEO Actions] Failed to reset PageSeo for "${pageKey}":`,
      error,
    );
    return {
      ok: false,
      success: false,
      message: "Database error: failed to reset page SEO settings.",
      error: "Database error: failed to reset page SEO settings.",
    };
  }
}

/**
 * Saves global Site SEO defaults (singleton key: "default").
 */
export async function saveSiteSeo(input: unknown): Promise<SeoActionResult> {
  await requireAdmin();

  const parseResult = siteSeoSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(
      ([_, errs]) => errs && errs.length > 0,
    );
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return {
      ok: false,
      success: false,
      message,
      error: message,
      fieldErrors,
    };
  }

  const validatedData = parseResult.data;

  try {
    if (isSiteSeoEmpty(validatedData)) {
      await db.siteSeo.deleteMany({
        where: { key: "default" },
      });
      triggerSeoRevalidation();
      return {
        ok: true,
        success: true,
        message: "Site SEO defaults reset to system defaults.",
      };
    }

    const cleanedSiteData = {
      siteName: cleanString(validatedData.siteName),
      defaultDescription: cleanString(validatedData.defaultDescription),
      defaultOgImage: cleanString(validatedData.defaultOgImage),
      twitterSite: cleanString(validatedData.twitterSite),
    };

    await db.siteSeo.upsert({
      where: { key: "default" },
      create: {
        key: "default",
        ...cleanedSiteData,
      },
      update: cleanedSiteData,
    });

    triggerSeoRevalidation();
    return {
      ok: true,
      success: true,
      message: "Site SEO defaults saved successfully.",
    };
  } catch (error) {
    console.error("[SEO Actions] Failed to save SiteSeo:", error);
    return {
      ok: false,
      success: false,
      message: "Database error: failed to save site SEO defaults.",
      error: "Database error: failed to save site SEO defaults.",
    };
  }
}

/**
 * Resets global Site SEO defaults by deleting the singleton row.
 */
export async function resetSiteSeo(): Promise<SeoActionResult> {
  await requireAdmin();

  try {
    await db.siteSeo.deleteMany({
      where: { key: "default" },
    });
    triggerSeoRevalidation();
    return {
      ok: true,
      success: true,
      message: "Site SEO defaults reset to system defaults.",
    };
  } catch (error) {
    console.error("[SEO Actions] Failed to reset SiteSeo:", error);
    return {
      ok: false,
      success: false,
      message: "Database error: failed to reset site SEO defaults.",
      error: "Database error: failed to reset site SEO defaults.",
    };
  }
}

