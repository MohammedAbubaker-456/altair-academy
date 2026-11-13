/**
 * Admin Leads Server Queries
 *
 * Provides paginated, searchable querying for customer enquiry leads.
 * Strictly enforces admin session authentication and newest-first ordering.
 *
 * Location: src/server/admin/leads.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Prisma, LeadStatus } from "@prisma/client";

export interface GetLeadsParams {
  q?: string | undefined;
  status?: LeadStatus | "ALL" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getLeadsAdmin(params: GetLeadsParams = {}) {
  await requireAdmin();

  const { q, status, page = 1, pageSize = 15 } = params;
  const currentPage = Math.max(1, page);
  const take = Math.max(1, Math.min(50, pageSize));
  const skip = (currentPage - 1) * take;

  const where: Prisma.LeadWhereInput = {};

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
      { message: { contains: term } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
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

export async function getLeadByIdAdmin(id: string) {
  await requireAdmin();

  if (!/^[a-f0-9]{24}$/.test(id)) {
    return null;
  }

  return db.lead.findUnique({
    where: { id },
  });
}
