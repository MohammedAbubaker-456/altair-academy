/**
 * Admin Legal Pages Overview Page
 *
 * Server Component fetching legal pages and rendering the LegalTable.
 *
 * Location: src/app/admin/(dashboard)/legal/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getLegalPagesAdmin } from "@/server/admin/legal";
import { LegalTable } from "./LegalTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legal Pages | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLegalPage() {
  const pages = await getLegalPagesAdmin();

  return (
    <LegalTable
      pages={pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        metaDescription: p.metaDescription,
        showInFooter: p.showInFooter,
        isCore: p.isCore,
        order: p.order,
        status: p.status,
        updatedAt: p.updatedAt,
      }))}
    />
  );
}
