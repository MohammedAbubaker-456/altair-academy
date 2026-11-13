/**
 * Admin Careers & Job Openings Server Queries
 *
 * Provides paginated, searchable querying for administrative management of job openings.
 *
 * Location: src/server/admin/careers.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Prisma, Status } from "@prisma/client";

export interface GetCareersParams {
  q?: string | undefined;
  status?: Status | "ALL" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getCareersAdmin(params: GetCareersParams = {}) {
  await requireAdmin();

  const { q, status, page = 1, pageSize = 10 } = params;

  const where: Prisma.JobOpeningWhereInput = {};

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { title: { contains: term } },
      { location: { contains: term } },
      { scope: { contains: term } },
      { summary: { contains: term } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.jobOpening.count({ where }),
    db.jobOpening.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getJobOpeningById(id: string) {
  await requireAdmin();

  return db.jobOpening.findUnique({
    where: { id },
  });
}
