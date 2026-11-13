/**
 * Public Queries: Team Members & Instructors
 *
 * Fetches management team members and instructors filtered by placements and active status.
 *
 * Location: src/server/queries/team.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";
import { readList } from "@/lib/lists";

function formatMember<T extends { expertise: string }>(member: T | null) {
  if (!member) return null;
  return {
    ...member,
    expertise: readList(member.expertise),
  };
}

export async function getManagementTeam() {
  const members = await db.teamMember.findMany({
    where: {
      status: "ACTIVE",
      showInManagement: true,
    },
    orderBy: {
      managementOrder: "asc",
    },
  });
  return members.map((m) => formatMember(m)!);
}

export async function getInstructors() {
  const members = await db.teamMember.findMany({
    where: {
      status: "ACTIVE",
      showInInstructors: true,
    },
    orderBy: {
      instructorOrder: "asc",
    },
  });
  return members.map((m) => formatMember(m)!);
}

export async function getActiveTeamMemberBySlug(slug: string) {
  const member = await db.teamMember.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      showInManagement: true,
    },
  });
  return formatMember(member);
}
