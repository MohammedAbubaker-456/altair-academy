/**
 * Public Queries: Careers & Job Openings
 *
 * Fetches active job openings ordered by display order then creation date.
 * Plain serializable DTOs strictly filtered by status: ACTIVE.
 *
 * Location: src/server/queries/careers.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";
import type { EmploymentType, Status } from "@prisma/client";

export interface JobOpeningDTO {
  id: string;
  title: string;
  employmentType: EmploymentType;
  location: string;
  scope: string;
  summary: string;
  order: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export async function getActiveJobOpenings(): Promise<JobOpeningDTO[]> {
  const openings = await db.jobOpening.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return openings.map((o) => ({
    id: o.id,
    title: o.title,
    employmentType: o.employmentType,
    location: o.location,
    scope: o.scope,
    summary: o.summary,
    order: o.order,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));
}
