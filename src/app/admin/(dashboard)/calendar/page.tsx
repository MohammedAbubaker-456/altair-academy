/**
 * Admin Calendar Management Page
 *
 * Server Component fetching filtered sessions, available years, and course codes
 * to render the tabbed administrative training calendar manager.
 *
 * Location: src/app/admin/(dashboard)/calendar/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAdminCalendarCourses,
  getAdminCalendarSessions,
  getAvailableCalendarYears,
} from "@/server/admin/calendar";
import { CalendarManager } from "./CalendarManager";
import type { SessionKind, Status } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Calendar | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminCalendarPageProps {
  searchParams: Promise<{
    tab?: "sessions" | "courses";
    year?: string;
    month?: string;
    course?: string;
    type?: SessionKind | "ALL";
    status?: Status | "ALL";
    upcoming?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  await requireAdmin();
  const params = await searchParams;

  const tab = params.tab === "courses" ? "courses" : "sessions";
  const page = params.page ? parseInt(params.page, 10) : 1;
  const month = params.month && params.month !== "ALL" ? parseInt(params.month, 10) : "ALL";
  const courseId = params.course;
  const type = params.type;
  const status = params.status;
  const upcomingOnly = params.upcoming === "true";
  const q = params.q;

  // Retrieve available years to compute default year
  const availableYears = await getAvailableCalendarYears();
  const currentYear = new Date().getFullYear();

  let defaultYear: number | "ALL" = "ALL";
  if (availableYears.includes(currentYear)) {
    defaultYear = currentYear;
  } else if (availableYears.length > 0) {
    defaultYear = availableYears[0]!; // already sorted descending
  }

  // Parse requested year or fall back to defaultYear
  let activeYear: number | "ALL" = defaultYear;
  if (params.year) {
    activeYear = params.year === "ALL" ? "ALL" : parseInt(params.year, 10);
  }

  const [courses, sessionsResult] = await Promise.all([
    getAdminCalendarCourses(),
    getAdminCalendarSessions({
      year: activeYear,
      month: isNaN(Number(month)) ? "ALL" : (month as number),
      courseId,
      type,
      status,
      upcomingOnly,
      q,
      page: isNaN(page) ? 1 : page,
      pageSize: 15,
    }),
  ]);

  return (
    <CalendarManager
      initialTab={tab}
      courses={courses}
      sessions={{
        items: sessionsResult.items,
        total: sessionsResult.total,
        page: sessionsResult.page,
        pageSize: sessionsResult.pageSize,
        totalPages: sessionsResult.totalPages,
        availableYears,
        defaultYear,
      }}
    />
  );
}
