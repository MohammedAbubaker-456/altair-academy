/**
 * Admin Calendar Server Queries
 *
 * Provides filtered, paginated queries for managing training sessions and
 * calendar course codes in the admin dashboard.
 *
 * Location: src/server/admin/calendar.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { getTodayDateString } from "@/lib/date";
import type { Prisma, SessionKind, Status } from "@prisma/client";

export interface GetAdminSessionsParams {
  year?: number | "ALL" | undefined;
  month?: number | "ALL" | undefined;
  courseId?: string | "ALL" | undefined;
  type?: SessionKind | "ALL" | undefined;
  status?: Status | "ALL" | undefined;
  upcomingOnly?: boolean | undefined;
  q?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getAdminCalendarCourses() {
  await requireAdmin();

  return db.calendarCourse.findMany({
    orderBy: [{ order: "asc" }, { code: "asc" }],
    include: {
      _count: {
        select: { sessions: true },
      },
    },
  });
}

export async function getAvailableCalendarYears(): Promise<number[]> {
  await requireAdmin();

  const sessions = await db.calendarSession.findMany({
    select: { startDate: true, endDate: true },
  });

  const years = new Set<number>();
  for (const s of sessions) {
    const y1 = parseInt(s.startDate.slice(0, 4), 10);
    const y2 = parseInt(s.endDate.slice(0, 4), 10);
    if (!isNaN(y1)) years.add(y1);
    if (!isNaN(y2)) years.add(y2);
  }

  return Array.from(years).sort((a, b) => b - a);
}

export async function getAdminCalendarSessions(params: GetAdminSessionsParams = {}) {
  await requireAdmin();

  const {
    year,
    month,
    courseId,
    type,
    status,
    upcomingOnly,
    q,
    page = 1,
    pageSize = 15,
  } = params;

  const where: Prisma.CalendarSessionWhereInput = {};

  // Year & Month filter
  if (year && year !== "ALL") {
    if (month && month !== "ALL") {
      const mStr = String(month).padStart(2, "0");
      const lastDay = new Date(year, month, 0).getDate();
      const monthStart = `${year}-${mStr}-01`;
      const monthEnd = `${year}-${mStr}-${String(lastDay).padStart(2, "0")}`;
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { startDate: { lte: monthEnd } },
        { endDate: { gte: monthStart } },
      ];
    } else {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { startDate: { lte: yearEnd } },
        { endDate: { gte: yearStart } },
      ];
    }
  } else if (month && month !== "ALL") {
    // If only month is chosen without year, match month substring in either start or end date
    const mStr = `-${String(month).padStart(2, "0")}-`;
    where.OR = [
      { startDate: { contains: mStr } },
      { endDate: { contains: mStr } },
    ];
  }

  // Course filter
  if (courseId && courseId !== "ALL") {
    where.courseId = courseId;
  }

  // Session Type filter (Training / Exam)
  if (type && type !== "ALL") {
    where.kind = type;
  }

  // Status filter (ACTIVE / INACTIVE)
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Upcoming only filter
  if (upcomingOnly) {
    const today = getTodayDateString("Asia/Kuala_Lumpur");
    where.endDate = { gte: today };
  }

  // Search filter (on note or location)
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      ...(Array.isArray(where.OR) ? where.OR : []),
      { note: { contains: term, mode: "insensitive" } },
      { location: { contains: term, mode: "insensitive" } },
      { level: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    db.calendarSession.count({ where }),
    db.calendarSession.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            order: true,
            status: true,
          },
        },
      },
      orderBy: [
        { startDate: "asc" },
        { course: { order: "asc" } },
      ],
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

export async function getAdminCalendarSessionById(id: string) {
  await requireAdmin();

  return db.calendarSession.findUnique({
    where: { id },
    include: {
      course: true,
    },
  });
}
