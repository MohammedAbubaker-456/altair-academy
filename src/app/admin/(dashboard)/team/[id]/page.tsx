/**
 * Admin Edit Team Member Page
 *
 * Fetches team member details by ID and renders pre-populated TeamForm.
 *
 * Location: src/app/admin/(dashboard)/team/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamMemberByIdAdmin } from "@/server/admin/team";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Team Member | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminEditTeamMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTeamMemberPage({ params }: AdminEditTeamMemberPageProps) {
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);

  if (!member) {
    notFound();
  }

  return (
    <TeamForm
      initialData={{
        id: member.id,
        name: member.name,
        slug: member.slug,
        role: member.role,
        shortBio: member.shortBio,
        instructorName: member.instructorName,
        instructorRole: member.instructorRole,
        fullBio: member.fullBio,
        expertise: member.expertise,
        image: member.image,
        placements: member.placements,
        managementOrder: member.managementOrder,
        instructorOrder: member.instructorOrder,
        status: member.status,
      }}
    />
  );
}
