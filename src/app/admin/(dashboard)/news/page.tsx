/**
 * Admin News Posts List Page
 *
 * Server Component fetching all news posts for the administrative portal.
 *
 * Location: src/app/admin/(dashboard)/news/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getNewsPostsAdmin } from "@/server/admin/news";
import { NewsTable } from "./NewsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewsPage() {
  const posts = await getNewsPostsAdmin();

  return <NewsTable items={posts} />;
}
