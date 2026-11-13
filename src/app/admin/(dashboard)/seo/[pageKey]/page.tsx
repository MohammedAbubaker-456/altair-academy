/**
 * Admin Edit Page SEO Route
 *
 * Server Component rendering the editor for a specific registry page key.
 * Validates pageKey against the static SEO registry and fetches PageSeo row from MongoDB.
 *
 * Location: src/app/admin/(dashboard)/seo/[pageKey]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { getRegistryItem, isRegistryKey } from "@/lib/seo/registry";
import { EditPageSeoForm } from "./EditPageSeoForm";

export const dynamic = "force-dynamic";

interface EditPageSeoProps {
  params: Promise<{
    pageKey: string;
  }>;
}

export async function generateMetadata({ params }: EditPageSeoProps): Promise<Metadata> {
  const { pageKey } = await params;
  const item = getRegistryItem(pageKey);

  if (!item) {
    return {
      title: "Page Not Found | Altair Academy Admin",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Edit SEO — ${item.label} | Altair Academy Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function EditPageSeoPage({ params }: EditPageSeoProps) {
  await requireAdmin();
  const { pageKey } = await params;

  if (!isRegistryKey(pageKey)) {
    notFound();
  }

  const registryItem = getRegistryItem(pageKey);
  if (!registryItem) {
    notFound();
  }

  const pageSeo = await db.pageSeo.findUnique({
    where: { pageKey },
  });

  return <EditPageSeoForm registryItem={registryItem} initialPageSeo={pageSeo} />;
}
