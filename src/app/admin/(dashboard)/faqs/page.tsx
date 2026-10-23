/**
 * Admin FAQs List Page
 *
 * Server Component fetching all FAQ entries for the administrative portal.
 *
 * Location: src/app/admin/(dashboard)/faqs/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getFaqsAdmin } from "@/server/admin/faqs";
import { FaqsManager } from "./FaqsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQs Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFaqsPage() {
  const faqs = await getFaqsAdmin();

  return <FaqsManager faqs={faqs} />;
}
