/**
 * Admin Team Members List Page
 *
 * Server Component fetching all team and faculty records for management.
 *
 * Location: src/app/admin/(dashboard)/team/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getTeamMembersAdmin } from "@/server/admin/team";
import { TeamTable } from "./TeamTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminTeamPage() {
  const members = await getTeamMembersAdmin();

  return <TeamTable items={members} />;
}
