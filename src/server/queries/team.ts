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

export async function getManagementTeam() {
  return db.teamMember.findMany({
    where: {
      status: "ACTIVE",
      placements: {
        has: "MANAGEMENT",
      },
    },
    orderBy: {
      managementOrder: "asc",
    },
  });
}

export async function getInstructors() {
  return db.teamMember.findMany({
    where: {
      status: "ACTIVE",
      placements: {
        has: "INSTRUCTOR",
      },
    },
    orderBy: {
      instructorOrder: "asc",
    },
  });
}

export async function getActiveTeamMemberBySlug(slug: string) {
  return db.teamMember.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      placements: {
        has: "MANAGEMENT",
      },
    },
  });
}
