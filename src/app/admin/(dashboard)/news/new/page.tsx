/**
 * Admin Create News Post Page
 *
 * Renders the news post creation form.
 *
 * Location: src/app/admin/(dashboard)/news/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { NewsForm } from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add News Post | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewNewsPostPage() {
  return <NewsForm />;
}
