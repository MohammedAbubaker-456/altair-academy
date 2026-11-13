/**
 * Admin Team Members Data Query
 *
 * Provides administrative data access for team and instructor records
 * with search and placement filtering.
 *
 * Location: src/server/admin/team.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { readList } from "@/lib/lists";
import type { Prisma } from "@prisma/client";
import type { TeamPlacement } from "@/types/team";

export interface TeamAdminParams {
  q?: string | undefined;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | undefined;
  placement?: TeamPlacement | "ALL" | undefined;
}

function formatTeamMember<T extends { showInManagement: boolean; showInInstructors: boolean; expertise: string }>(
  member: T,
) {
  const placements: TeamPlacement[] = [];
  if (member.showInManagement) placements.push("MANAGEMENT");
  if (member.showInInstructors) placements.push("INSTRUCTOR");
  return {
    ...member,
    placements,
    expertise: readList(member.expertise),
  };
}

export async function getTeamMembersAdmin(params: TeamAdminParams = {}) {
  await requireAdmin();

  const where: Prisma.TeamMemberWhereInput = {};

  if (params.q?.trim()) {
    const query = params.q.trim();
    where.OR = [
      { name: { contains: query } },
      { role: { contains: query } },
      { instructorName: { contains: query } },
      { instructorRole: { contains: query } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.placement && params.placement !== "ALL") {
    if (params.placement === "MANAGEMENT") {
      where.showInManagement = true;
    } else if (params.placement === "INSTRUCTOR") {
      where.showInInstructors = true;
    }
  }

  const members = await db.teamMember.findMany({
    where,
    orderBy: [{ managementOrder: "asc" }, { instructorOrder: "asc" }],
  });

  return members.map(formatTeamMember);
}

export async function getTeamMemberByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  const member = await db.teamMember.findUnique({
    where: { id },
  });

  if (!member) return null;

  return formatTeamMember(member);
}
