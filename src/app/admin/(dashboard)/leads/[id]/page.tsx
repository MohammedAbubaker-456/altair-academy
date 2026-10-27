/**
 * Admin Lead Detail Page
 *
 * Server Component fetching lead enquiry by ID and rendering LeadDetailView.
 * Returns 404 if not found or invalid ObjectId.
 *
 * Location: src/app/admin/(dashboard)/leads/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeadByIdAdmin } from "@/server/admin/leads";
import { LeadDetailView } from "./LeadDetailView";

export const dynamic = "force-dynamic";

interface AdminLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminLeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadByIdAdmin(id);

  if (!lead) {
    return {
      title: "Lead Not Found | Altair Academy Admin",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Lead: ${lead.name} | Altair Academy Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLeadDetailPage({ params }: AdminLeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadByIdAdmin(id);

  if (!lead) {
    notFound();
  }

  return <LeadDetailView lead={lead} />;
}
