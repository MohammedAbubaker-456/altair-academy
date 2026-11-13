/**
 * Admin Upcoming Intakes Data Queries
 *
 * Provides administrative data access, pagination, searching, and filtering
 * for scheduled home page training intakes.
 *
 * Location: src/server/admin/intakes.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { getTodayDateString } from "@/lib/date";
import { readList } from "@/lib/lists";
import type { Prisma, Status } from "@prisma/client";

export type IntakeTimingFilter = "UPCOMING" | "PAST" | "ALL";

export interface GetUpcomingIntakesParams {
  q?: string | undefined;
  status?: Status | "ALL" | undefined;
  timing?: IntakeTimingFilter | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getUpcomingIntakesAdmin(params: GetUpcomingIntakesParams = {}) {
  await requireAdmin();

  const { q, status, timing = "UPCOMING", page = 1, pageSize = 10 } = params;
  const today = getTodayDateString("Asia/Kuala_Lumpur");

  const where: Prisma.UpcomingIntakeWhereInput = {};

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [{ title: { contains: term } }, { location: { contains: term } }];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (timing === "UPCOMING") {
    where.endDate = { gte: today };
  } else if (timing === "PAST") {
    where.endDate = { lt: today };
  }

  const orderBy: Prisma.UpcomingIntakeOrderByWithRelationInput[] =
    timing === "PAST"
      ? [{ startDate: "desc" }, { order: "asc" }, { createdAt: "desc" }]
      : [{ startDate: "asc" }, { order: "asc" }, { createdAt: "asc" }];

  const [total, items] = await Promise.all([
    db.upcomingIntake.count({ where }),
    db.upcomingIntake.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: items.map((item) => ({
      ...item,
      points: readList(item.points),
    })),
    total,
    page,
    pageSize,
    totalPages,
    today,
  };
}

export async function getIntakeByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  const intake = await db.upcomingIntake.findUnique({
    where: { id },
  });

  if (!intake) return null;

  return {
    ...intake,
    points: readList(intake.points),
  };
}
