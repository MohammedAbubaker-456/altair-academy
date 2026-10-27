/**
 * Admin Career Applications Page
 *
 * Displays all candidate job applications and uploaded resumes from /careers.
 * Supports keyword search, candidate status filtering, and pagination.
 *
 * Location: src/app/admin/(dashboard)/applications/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getApplicationsAdmin } from "@/server/admin/applications";
import { ApplicationsTable } from "./ApplicationsTable";
import type { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidate Applications | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminApplicationsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const status = resolvedParams.status as ApplicationStatus | "ALL" | undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const { items, total, totalPages, pageSize } = await getApplicationsAdmin({
    q,
    status: status || "ALL",
    page: isNaN(page) ? 1 : page,
    pageSize: 15,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Candidate Job Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review instructor resumes, candidate specialisations, and applicant qualifications submitted via /careers.
          </p>
        </div>
      </div>

      <ApplicationsTable
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
