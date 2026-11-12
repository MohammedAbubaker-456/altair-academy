/**
 * Admin SEO Overview Page
 *
 * Server Component rendering the global SEO dashboard and pages registry.
 * Queries current PageSeo rows and SiteSeo singleton from MongoDB.
 *
 * Location: src/app/admin/(dashboard)/seo/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { getAllRegistryItems } from "@/lib/seo/registry";
import { SeoManager } from "./SeoManager";
import type { PageSeo } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO & Meta Tags | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSeoPage() {
  await requireAdmin();

  const [siteSeo, pageSeoList] = await Promise.all([
    db.siteSeo.findUnique({
      where: { key: "default" },
    }),
    db.pageSeo.findMany(),
  ]);

  const pageSeoMap: Record<string, PageSeo> = {};
  for (const row of pageSeoList) {
    pageSeoMap[row.pageKey] = row;
  }

  const registryItems = getAllRegistryItems();

  return (
    <SeoManager
      registryItems={registryItems}
      pageSeoMap={pageSeoMap}
      initialSiteSeo={siteSeo}
    />
  );
}

