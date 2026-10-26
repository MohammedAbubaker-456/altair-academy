/**
 * Admin Create Legal Page
 *
 * Server Component rendering empty LegalForm for drafting a new policy document.
 *
 * Location: src/app/admin/(dashboard)/legal/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { LegalForm } from "../LegalForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Legal Page | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewLegalPage() {
  return <LegalForm />;
}
