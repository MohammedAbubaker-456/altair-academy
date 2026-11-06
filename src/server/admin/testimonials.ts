/**
 * Admin Testimonials Data Queries
 *
 * Provides administrative data access, pagination, searching, and filtering
 * for student and employer testimonials.
 *
 * Location: src/server/admin/testimonials.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import type { Prisma, Status } from "@prisma/client";

export interface GetTestimonialsParams {
  q?: string | undefined;
  status?: Status | "ALL" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getTestimonialsAdmin(params: GetTestimonialsParams = {}) {
  await requireAdmin();

  const { q, status, page = 1, pageSize = 10 } = params;

  const where: Prisma.TestimonialWhereInput = {};

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { quote: { contains: term, mode: "insensitive" } },
      { name: { contains: term, mode: "insensitive" } },
      { company: { contains: term, mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.testimonial.count({ where }),
    db.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
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

export async function getTestimonialByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.testimonial.findUnique({
    where: { id },
  });
}

