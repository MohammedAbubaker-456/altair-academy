/**
 * Public Queries: Training Calendar
 *
 * Fetches active calendar courses and scheduled sessions for the public calendar view.
 * Plain serialisable DTOs (strings only, no Prisma types or Dates).
 *
 * Location: src/server/queries/calendar.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export interface CalendarCourseDTO {
  id: string;
  code: string;
  name: string;
  order: number;
}

export interface CalendarSessionDTO {
  id: string;
  courseCode: string;
  courseName: string;
  kind: "training" | "exam";
  level: string | null;
  startDate: string;
  endDate: string;
  timeLabel: string | null;
  location: string | null;
  note: string | null;
}

export async function getActiveCalendarCourses(): Promise<CalendarCourseDTO[]> {
  const courses = await db.calendarCourse.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      order: "asc",
    },
  });

  return courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    order: c.order,
  }));
}

export async function getActiveCalendarSessions(): Promise<CalendarSessionDTO[]> {
  const sessions = await db.calendarSession.findMany({
    where: {
      status: "ACTIVE",
      course: {
        status: "ACTIVE",
      },
    },
    include: {
      course: {
        select: {
          code: true,
          name: true,
          order: true,
        },
      },
    },
    orderBy: [
      { startDate: "asc" },
      { course: { order: "asc" } },
    ],
  });

  return sessions.map((s) => ({
    id: s.id,
    courseCode: s.course.code,
    courseName: s.course.name,
    kind: s.kind === "TRAINING" ? "training" : "exam",
    level: s.level ?? null,
    startDate: s.startDate,
    endDate: s.endDate,
    timeLabel: s.timeLabel ?? null,
    location: s.location ?? null,
    note: s.note ?? null,
  }));
}
