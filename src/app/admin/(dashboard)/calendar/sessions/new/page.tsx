/**
 * Admin Calendar New Session Page
 *
 * Server Component preparing courses and duplicate session data
 * to render the intake session creation form.
 *
 * Location: src/app/admin/(dashboard)/calendar/sessions/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { db } from "@/lib/db";
import { getAdminCalendarCourses } from "@/server/admin/calendar";
import { SessionForm } from "../SessionForm";
import type { CalendarSessionInput } from "@/lib/validation/calendar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Scheduled Session | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface NewSessionPageProps {
  searchParams: Promise<{
    duplicateFrom?: string;
  }>;
}

export default async function NewSessionPage({ searchParams }: NewSessionPageProps) {
  await requireAdmin();
  const { duplicateFrom } = await searchParams;

  const [courses, existingSessions] = await Promise.all([
    getAdminCalendarCourses(),
    db.calendarSession.findMany({
      select: {
        id: true,
        courseId: true,
        kind: true,
        startDate: true,
        endDate: true,
      },
    }),
  ]);

  let prefilledData: Partial<CalendarSessionInput> | null = null;

  if (duplicateFrom && isValidObjectId(duplicateFrom)) {
    const source = await db.calendarSession.findUnique({
      where: { id: duplicateFrom },
    });
    if (source) {
      prefilledData = {
        courseId: source.courseId,
        kind: source.kind,
        level: source.level,
        startDate: "",
        endDate: "",
        timeLabel: source.timeLabel,
        location: source.location,
        note: source.note,
        status: source.status,
      };
    }
  }

  return (
    <SessionForm
      courses={courses}
      existingSessions={existingSessions}
      prefilledData={prefilledData}
    />
  );
}
