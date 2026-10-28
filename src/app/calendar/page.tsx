/**
 * Public Training Calendar Page
 *
 * Server Component rendering the database-driven training and examination schedule.
 *
 * Location: src/app/calendar/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { CalendarContent } from "@/components/site/CalendarContent";
import { getActiveCalendarCourses, getActiveCalendarSessions } from "@/server/queries/calendar";

export const dynamic = "force-dynamic";

function formatCourseCodesList(codes: string[]): string {
  if (codes.length === 0) return "";
  if (codes.length === 1) return codes[0]!;
  if (codes.length === 2) return `${codes[0]} and ${codes[1]}`;
  return `${codes.slice(0, -1).join(", ")} and ${codes[codes.length - 1]}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [courses, sessions] = await Promise.all([
    getActiveCalendarCourses(),
    getActiveCalendarSessions(),
  ]);

  const currentYear = new Date().getFullYear();
  const sessionYears = Array.from(
    new Set(
      sessions.flatMap((s) => {
        const startY = parseInt(s.startDate.slice(0, 4), 10);
        const endY = parseInt(s.endDate.slice(0, 4), 10);
        return [startY, endY].filter((y) => !isNaN(y));
      }),
    ),
  );

  let displayYear = currentYear;
  if (sessionYears.includes(currentYear)) {
    displayYear = currentYear;
  } else if (sessionYears.length > 0) {
    displayYear = Math.max(...sessionYears);
  }

  const courseCodes = courses.map((c) => c.code);
  const formattedCodes = formatCourseCodesList(courseCodes);
  const description = formattedCodes
    ? `Altair Academy ${displayYear} NDT Level 2 training and examination calendar for ${formattedCodes} courses.`
    : `Altair Academy ${displayYear} NDT Level 2 training and examination calendar.`;

  const title = `${displayYear} Training Calendar | Altair Academy`;

  return {
    title,
    description,
    openGraph: {
      title,
      description: "Month-by-month NDT Level 2 training and examination dates at Altair Academy.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function CalendarPage() {
  const [courses, sessions] = await Promise.all([
    getActiveCalendarCourses(),
    getActiveCalendarSessions(),
  ]);

  const currentYear = new Date().getFullYear();
  const sessionYears = Array.from(
    new Set(
      sessions.flatMap((s) => {
        const startY = parseInt(s.startDate.slice(0, 4), 10);
        const endY = parseInt(s.endDate.slice(0, 4), 10);
        return [startY, endY].filter((y) => !isNaN(y));
      }),
    ),
  );

  let displayYear = currentYear;
  if (sessionYears.includes(currentYear)) {
    displayYear = currentYear;
  } else if (sessionYears.length > 0) {
    displayYear = Math.max(...sessionYears);
  }

  return <CalendarContent courses={courses} sessions={sessions} displayYear={displayYear} />;
}
