/**
 * Admin Create Job Opening Page
 *
 * Location: src/app/admin/(dashboard)/careers/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { CareersForm } from "../CareersForm";

export const metadata: Metadata = {
  title: "New Job Opening | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewJobOpeningPage() {
  return <CareersForm />;
}
