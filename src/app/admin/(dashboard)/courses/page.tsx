/**
 * Admin Courses List Page
 *
 * Server Component fetching filtered and paginated course records,
 * rendered within the interactive CoursesTable component.
 *
 * Location: src/app/admin/(dashboard)/courses/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getCoursesAdmin } from "@/server/admin/courses";
import { CoursesTable } from "./CoursesTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminCoursesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
    page?: string;
  }>;
}

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  const params = await searchParams;

  const page = params["page"] ? parseInt(params["page"], 10) : 1;
  const q = params["q"];
  const status = params["status"];

  const { items, total, totalPages } = await getCoursesAdmin({
    q,
    status,
    page: isNaN(page) ? 1 : page,
    pageSize: 10,
  });

  return (
    <CoursesTable
      items={items}
      total={total}
      page={isNaN(page) ? 1 : page}
      pageSize={10}
      totalPages={totalPages}
    />
  );
}
