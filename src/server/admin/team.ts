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
import type { Prisma, TeamPlacement } from "@prisma/client";

export interface TeamAdminParams {
  q?: string | undefined;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | undefined;
  placement?: TeamPlacement | "ALL" | undefined;
}

export async function getTeamMembersAdmin(params: TeamAdminParams = {}) {
  await requireAdmin();

  const where: Prisma.TeamMemberWhereInput = {};

  if (params.q?.trim()) {
    const query = params.q.trim();
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { role: { contains: query, mode: "insensitive" } },
      { instructorName: { contains: query, mode: "insensitive" } },
      { instructorRole: { contains: query, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.placement && params.placement !== "ALL") {
    where.placements = { has: params.placement };
  }

  return db.teamMember.findMany({
    where,
    orderBy: [{ managementOrder: "asc" }, { instructorOrder: "asc" }],
  });
}

export async function getTeamMemberByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.teamMember.findUnique({
    where: { id },
  });
}
