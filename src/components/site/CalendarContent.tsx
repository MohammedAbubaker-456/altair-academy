/**
 * Training Calendar Page Shell Component
 *
 * Server Component fetching active contact details and composing Header,
 * interactive CalendarViewer with database sessions/courses, and Footer.
 *
 * Location: src/components/site/CalendarContent.tsx
 * Type: Server Component
 */

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CalendarViewer } from "@/components/site/CalendarViewer";
import { getContactInfo } from "@/server/queries/contact";
import type { CalendarCourseDTO, CalendarSessionDTO } from "@/server/queries/calendar";

export async function CalendarContent({
  courses,
  sessions,
  displayYear,
}: {
  courses: CalendarCourseDTO[];
  sessions: CalendarSessionDTO[];
  displayYear: number;
}) {
  const contactInfo = await getContactInfo();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <CalendarViewer
        contactInfo={contactInfo}
        courses={courses}
        sessions={sessions}
        displayYear={displayYear}
      />
      <Footer />
    </div>
  );
}
