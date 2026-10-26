/**
 * Admin Contact Details Page
 *
 * Server Component fetching contact details and channels, rendering the ContactManager.
 *
 * Location: src/app/admin/(dashboard)/contact/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getContactDetailsAdmin } from "@/server/admin/contact";
import { ContactManager } from "./ContactManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Details | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminContactPage() {
  const details = await getContactDetailsAdmin();

  return (
    <ContactManager
      initialDetails={details.map((d) => ({
        id: d.id,
        type: d.type,
        label: d.label,
        value: d.value,
        link: d.link,
        order: d.order,
        status: d.status,
      }))}
    />
  );
}
