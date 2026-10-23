/**
 * Admin Create Team Member Page
 *
 * Renders the team member creation form.
 *
 * Location: src/app/admin/(dashboard)/team/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Team Member | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewTeamMemberPage() {
  return <TeamForm />;
}
