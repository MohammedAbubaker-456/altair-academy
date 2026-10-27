/**
 * Admin Leads Dashboard Page
 *
 * Displays all incoming contact enquiries and leads from the public website.
 * Supports keyword search, status filtering (NEW, CONTACTED, CLOSED), and pagination.
 *
 * Location: src/app/admin/(dashboard)/leads/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getLeadsAdmin } from "@/server/admin/leads";
import { LeadsTable } from "./LeadsTable";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads & Enquiries | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLeadsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const status = resolvedParams.status as LeadStatus | "ALL" | undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const { items, total, totalPages, pageSize } = await getLeadsAdmin({
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
            Customer Leads &amp; Enquiries
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, track, and manage all student and corporate course inquiries received via /contact.
          </p>
        </div>
      </div>

      <LeadsTable
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
