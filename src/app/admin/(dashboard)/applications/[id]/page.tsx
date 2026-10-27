/**
 * Admin Application Detail Page
 *
 * Server Component fetching candidate application by ID and rendering ApplicationDetailView.
 * Returns 404 if not found or invalid ObjectId.
 *
 * Location: src/app/admin/(dashboard)/applications/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApplicationByIdAdmin } from "@/server/admin/applications";
import { ApplicationDetailView } from "./ApplicationDetailView";

export const dynamic = "force-dynamic";

interface AdminApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplicationByIdAdmin(id);

  if (!application) {
    return {
      title: "Application Not Found | Altair Academy Admin",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Application: ${application.name} | Altair Academy Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminApplicationDetailPage({
  params,
}: AdminApplicationDetailPageProps) {
  const { id } = await params;
  const application = await getApplicationByIdAdmin(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetailView application={application} />;
}
