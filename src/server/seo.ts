/**
 * SEO Metadata Resolver & Server Query Service
 *
 * Implements server-side metadata resolution for Next.js App Router.
 * Resolves metadata field-by-field following priority order:
 * 1. Record override (metaTitle, metaDescription, ogImage on Course, NewsPost, TeamMember, LegalPage)
 * 2. PageSeo database row (or template row)
 * 3. Registry default
 * 4. SiteSeo database row (defaultDescription, defaultOgImage, twitterSite)
 * 5. Root site fallback
 *
 * All queries are wrapped with React cache() to guarantee deduplication per request.
 * Database errors gracefully fall back to baseline defaults without crashing page renders.
 *
 * Location: src/server/seo.ts
 * Type: Server-Only Module
 */

import "server-only";
import { cache } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getRegistryItem, isRegistryKey } from "@/lib/seo/registry";
import type { PageSeo, SiteSeo } from "@prisma/client";

export interface SeoContext {
  record?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    [key: string]: unknown;
  };
  replacements?: Record<string, string | null | undefined>;
  canonicalPath?: string;
  dynamicDefaults?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string | null;
  };
  publishedTime?: string;
  imageAlt?: string;
}

/**
 * Cached fetch for singleton SiteSeo row
 */
export const getSiteSeo = cache(async (): Promise<SiteSeo | null> => {
  try {
    return await db.siteSeo.findUnique({
      where: { key: "default" },
    });
  } catch (error) {
    console.error("[SEO] Failed to query SiteSeo:", error instanceof Error ? error.message : error);
    return null;
  }
});

/**
 * Cached fetch for specific PageSeo row by key
 */
export const getPageSeo = cache(async (pageKey: string): Promise<PageSeo | null> => {
  if (!pageKey || !isRegistryKey(pageKey)) return null;

  try {
    return await db.pageSeo.findUnique({
      where: { pageKey },
    });
  } catch (error) {
    console.error(
      `[SEO] Failed to query PageSeo for key "${pageKey}":`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
});

/**
 * Fetch all customized PageSeo rows for the admin table
 */
export async function getAllPageSeoRows(): Promise<PageSeo[]> {
  try {
    return await db.pageSeo.findMany();
  } catch (error) {
    console.error(
      "[SEO] Failed to query all PageSeo rows:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * Resolves an image path into an absolute URL if SITE_URL is set, or returns path as-is
 */
export function resolveOgImageUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return undefined;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const siteUrl = process.env["SITE_URL"]?.trim().replace(/\/+$/, "");
  if (siteUrl) {
    return trimmed.startsWith("/") ? `${siteUrl}${trimmed}` : `${siteUrl}/${trimmed}`;
  }

  return trimmed;
}

/**
 * Replaces placeholders in a template string, cleaning up undefined/unmatched tokens
 */
export function replacePlaceholders(
  template: string,
  replacements?: Record<string, string | null | undefined>,
): string {
  if (!template) return "";
  let result = template;

  if (replacements) {
    for (const [key, val] of Object.entries(replacements)) {
      const replacementStr = val !== null && val !== undefined ? String(val).trim() : "";
      result = result.split(key).join(replacementStr);
    }
  }

  // Remove any remaining unmatched {placeholder} tokens
  result = result.replace(/\{[a-zA-Z0-9_-]+\}/g, "");

  // Clean up any double spaces, leading/trailing dashes resulting from empty tokens
  result = result
    .replace(/\s+/g, " ")
    .replace(/\s+—\s+—/g, " —")
    .replace(/^\s*—\s*/, "")
    .replace(/\s*—\s*$/, "")
    .trim();

  return result;
}

/**
 * Computes the complete Next.js Metadata object for a given registry page key
 */
export async function getPageMetadata(pageKey: string, context?: SeoContext): Promise<Metadata> {
  const registryItem = getRegistryItem(pageKey);
  const [pageSeo, siteSeo] = await Promise.all([getPageSeo(pageKey), getSiteSeo()]);

  // 1. Resolve Raw Title
  const rawTitle =
    context?.record?.metaTitle?.trim() ||
    pageSeo?.title?.trim() ||
    context?.dynamicDefaults?.title?.trim() ||
    registryItem?.defaults.title ||
    "Altair Academy — Accredited Technical Training";

  const title = replacePlaceholders(rawTitle, context?.replacements);

  // 2. Resolve Raw Description
  const rawDescription =
    context?.record?.metaDescription?.trim() ||
    pageSeo?.description?.trim() ||
    context?.dynamicDefaults?.description?.trim() ||
    registryItem?.defaults.description ||
    siteSeo?.defaultDescription?.trim() ||
    "Accredited NDT, corrosion, BIM and management system training led by practising industry specialists.";

  const description = replacePlaceholders(rawDescription, context?.replacements);

  // 3. Resolve Open Graph Title
  const rawOgTitle =
    pageSeo?.ogTitle?.trim() ||
    context?.dynamicDefaults?.ogTitle?.trim() ||
    (pageSeo?.title ? pageSeo.title.trim() : registryItem?.defaults.ogTitle) ||
    title;

  const ogTitle = replacePlaceholders(rawOgTitle, context?.replacements);

  // 4. Resolve Open Graph Description
  const rawOgDescription =
    pageSeo?.ogDescription?.trim() ||
    context?.dynamicDefaults?.ogDescription?.trim() ||
    (pageSeo?.description ? pageSeo.description.trim() : registryItem?.defaults.ogDescription) ||
    description;

  const ogDescription = replacePlaceholders(rawOgDescription, context?.replacements);

  // 5. Resolve Social Image
  const rawOgImage =
    context?.record?.ogImage?.trim() ||
    pageSeo?.ogImage?.trim() ||
    context?.dynamicDefaults?.ogImage?.trim() ||
    siteSeo?.defaultOgImage?.trim() ||
    registryItem?.defaults.ogImage ||
    undefined;

  const absoluteImageUrl = resolveOgImageUrl(rawOgImage);

  // 6. Resolve Canonical URL
  const canonical = pageSeo?.canonicalPath?.trim() || context?.canonicalPath?.trim() || undefined;

  // 7. Resolve Robots / Indexing
  let robots: { index: boolean; follow: boolean } | undefined = undefined;
  if (pageSeo?.noIndex !== null && pageSeo?.noIndex !== undefined) {
    robots = pageSeo.noIndex ? { index: false, follow: false } : { index: true, follow: true };
  } else if (registryItem?.defaults.noIndex) {
    robots = { index: false, follow: false };
  }

  // 8. Open Graph & Twitter Objects
  const ogType = registryItem?.defaults.ogType || "website";
  const twitterCard = registryItem?.defaults.twitterCard || "summary_large_image";

  const images = absoluteImageUrl
    ? [
        {
          url: absoluteImageUrl,
          ...(context?.imageAlt ? { alt: context.imageAlt } : {}),
        },
      ]
    : undefined;

  const metadata: Metadata = {
    title,
    description,
    ...(robots ? { robots } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: ogType,
      ...(ogType === "article" && context?.publishedTime
        ? { publishedTime: context.publishedTime }
        : {}),
      ...(canonical ? { url: canonical } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      ...(siteSeo?.twitterSite ? { site: siteSeo.twitterSite } : {}),
      ...(absoluteImageUrl ? { images: [absoluteImageUrl] } : {}),
    },
  };

  return metadata;
}
