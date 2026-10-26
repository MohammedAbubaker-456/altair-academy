/**
 * Training Calendar Page Shell Component
 *
 * Server Component fetching active contact details and composing Header,
 * interactive CalendarViewer, and Footer.
 *
 * Location: src/components/site/CalendarContent.tsx
 * Type: Server Component
 */

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CalendarViewer } from "@/components/site/CalendarViewer";
import { getContactInfo } from "@/server/queries/contact";

export async function CalendarContent() {
  const contactInfo = await getContactInfo();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <CalendarViewer contactInfo={contactInfo} />
      <Footer />
    </div>
  );
}
