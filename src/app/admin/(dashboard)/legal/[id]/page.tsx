/**
 * Admin Edit Legal Page
 *
 * Fetches legal document details by ID and renders pre-populated LegalForm.
 *
 * Location: src/app/admin/(dashboard)/legal/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPageById } from "@/server/admin/legal";
import { LegalForm } from "../LegalForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Legal Page | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminEditLegalPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditLegalPage({ params }: AdminEditLegalPageProps) {
  const { id } = await params;
  const page = await getLegalPageById(id);

  if (!page) {
    notFound();
  }

  return (
    <LegalForm
      initialData={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        metaDescription: page.metaDescription,
        body: page.body,
        showInFooter: page.showInFooter,
        isCore: page.isCore,
        order: page.order,
        status: page.status,
      }}
    />
  );
}
