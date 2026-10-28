/**
 * Admin Calendar Edit Session Page
 *
 * Server Component resolving an existing intake session by ID
 * and rendering the pre-populated editing form.
 *
 * Location: src/app/admin/(dashboard)/calendar/sessions/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { db } from "@/lib/db";
import { getAdminCalendarCourses, getAdminCalendarSessionById } from "@/server/admin/calendar";
import { SessionForm } from "../SessionForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Scheduled Session | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditSessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  await requireAdmin();
  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  const [session, courses, existingSessions] = await Promise.all([
    getAdminCalendarSessionById(id),
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

  if (!session) {
    notFound();
  }

  return (
    <SessionForm
      initialData={{
        id: session.id,
        courseId: session.courseId,
        kind: session.kind,
        level: session.level,
        startDate: session.startDate,
        endDate: session.endDate,
        timeLabel: session.timeLabel,
        location: session.location,
        note: session.note,
        status: session.status,
      }}
      courses={courses}
      existingSessions={existingSessions}
    />
  );
}
