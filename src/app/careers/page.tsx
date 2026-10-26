/**
 * Public Careers & Open Positions Page
 *
 * Server Component fetching published job openings and contact details.
 *
 * Location: src/app/careers/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { CareersContent } from "@/components/site/CareersContent";
import { getActiveJobOpenings } from "@/server/queries/careers";
import { getContactInfo } from "@/server/queries/contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers at Altair Academy — Join Our NDT Training Team",
  description:
    "Open roles for NDT Level III instructors, assessors and training coordinators at Altair Academy. Submit your resume and join our team.",
  openGraph: {
    title: "Careers at Altair Academy",
    description:
      "Teach what you practise — instructor, assessor and coordinator openings at Altair Academy.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function CareersPage() {
  const [openings, contactInfo] = await Promise.all([getActiveJobOpenings(), getContactInfo()]);

  return <CareersContent openings={openings} contactInfo={contactInfo} />;
}
