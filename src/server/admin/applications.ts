/**
 * Admin Career Applications Server Queries
 *
 * Provides paginated, searchable querying for candidate job applications.
 * Enforces admin session authentication and newest-first ordering.
 *
 * Location: src/server/admin/applications.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Prisma, ApplicationStatus } from "@prisma/client";

export interface GetApplicationsParams {
  q?: string | undefined;
  status?: ApplicationStatus | "ALL" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getApplicationsAdmin(params: GetApplicationsParams = {}) {
  await requireAdmin();

  const { q, status, page = 1, pageSize = 15 } = params;
  const currentPage = Math.max(1, page);
  const take = Math.max(1, Math.min(50, pageSize));
  const skip = (currentPage - 1) * take;

  const where: Prisma.CareerApplicationWhereInput = {};

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
      { specialisation: { contains: term } },
      { message: { contains: term } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.careerApplication.count({ where }),
    db.careerApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return {
    items,
    total,
    page: currentPage,
    pageSize: take,
    totalPages,
  };
}

export async function getApplicationByIdAdmin(id: string) {
  await requireAdmin();

  if (!/^[a-f0-9]{24}$/.test(id)) {
    return null;
  }

  return db.careerApplication.findUnique({
    where: { id },
  });
}
