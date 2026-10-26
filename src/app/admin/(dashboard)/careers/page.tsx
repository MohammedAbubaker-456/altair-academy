/**
 * Admin Careers List Page
 *
 * Server Component fetching filtered and paginated job opening records,
 * rendered within the interactive CareersTable component.
 *
 * Location: src/app/admin/(dashboard)/careers/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getCareersAdmin } from "@/server/admin/careers";
import { CareersTable } from "./CareersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminCareersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
    page?: string;
  }>;
}

export default async function AdminCareersPage({ searchParams }: AdminCareersPageProps) {
  const params = await searchParams;

  const page = params["page"] ? parseInt(params["page"], 10) : 1;
  const q = params["q"];
  const status = params["status"];

  const { items, total, totalPages } = await getCareersAdmin({
    q,
    status,
    page: isNaN(page) ? 1 : page,
    pageSize: 10,
  });

  return (
    <CareersTable
      items={items}
      total={total}
      page={isNaN(page) ? 1 : page}
      pageSize={10}
      totalPages={totalPages}
    />
  );
}
