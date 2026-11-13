/**
 * Admin Upcoming Intakes Page
 *
 * Server Component fetching paginated, filtered upcoming intakes for administrative management.
 *
 * Location: src/app/admin/(dashboard)/intakes/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getUpcomingIntakesAdmin, type IntakeTimingFilter } from "@/server/admin/intakes";
import { IntakesManager } from "./IntakesManager";
import type { Status } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Intakes | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminIntakesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: Status | "ALL";
    timing?: IntakeTimingFilter;
    page?: string;
  }>;
}

export default async function AdminIntakesPage({ searchParams }: AdminIntakesPageProps) {
  const params = await searchParams;

  const page = params["page"] ? parseInt(params["page"], 10) : 1;
  const q = params["q"];
  const status = params["status"];
  const timing = (params["timing"] as IntakeTimingFilter) || "UPCOMING";

  const { items, total, totalPages, today } = await getUpcomingIntakesAdmin({
    q,
    status,
    timing,
    page: isNaN(page) ? 1 : page,
    pageSize: 10,
  });

  return (
    <IntakesManager
      items={items}
      total={total}
      page={isNaN(page) ? 1 : page}
      pageSize={10}
      totalPages={totalPages}
      today={today}
      currentTiming={timing}
    />
  );
}
