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
import { getPageMetadata } from "@/server/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("careers");
}

export default async function CareersPage() {
  const [openings, contactInfo] = await Promise.all([getActiveJobOpenings(), getContactInfo()]);

  return <CareersContent openings={openings} contactInfo={contactInfo} />;
}
