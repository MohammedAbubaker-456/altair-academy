/**
 * Public Queries: Legal Pages & Tokens
 *
 * Fetches active legal pages for footer navigation and detail rendering.
 * Provides canonical URL mapping and server-side placeholder token replacement.
 *
 * Location: src/server/queries/legal.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";
import type { LegacyContactInfo } from "./contact";

export interface FooterLegalLink {
  id: string;
  slug: string;
  title: string;
  href: string;
}

export interface LegalPageDTO {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  body: string;
  showInFooter: boolean;
  isCore: boolean;
  order: number;
  status: "ACTIVE" | "INACTIVE";
  updatedAt: Date;
}

import { legalHref } from "@/lib/legal";
export { legalHref };

/**
 * Fetches active legal pages marked to appear in the footer.
 */
export async function getFooterLegalLinks(): Promise<FooterLegalLink[]> {
  const pages = await db.legalPage.findMany({
    where: {
      status: "ACTIVE",
      showInFooter: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  return pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    href: legalHref(p.slug),
  }));
}

/**
 * Fetches an active legal page by its slug.
 */
export async function getActiveLegalPageBySlug(slug: string): Promise<LegalPageDTO | null> {
  const page = await db.legalPage.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
  });

  if (!page) return null;

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    metaDescription: page.metaDescription,
    body: page.body,
    showInFooter: page.showInFooter,
    isCore: page.isCore,
    order: page.order,
    status: page.status,
    updatedAt: page.updatedAt,
  };
}

/**
 * Replaces {{email}}, {{phone}}, {{address}} tokens with active contact details.
 * Any unrecognized tokens are preserved as plain text.
 */
export function replaceLegalTokens(body: string, contact: LegacyContactInfo): string {
  if (!body) return "";

  return body.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, token) => {
    const key = token.toLowerCase();
    switch (key) {
      case "email":
        return contact.email ?? "";
      case "phone":
        return contact.phoneDisplay ?? contact.phoneHref ?? "";
      case "address":
        return contact.address ?? "";
      default:
        return match;
    }
  });
}
