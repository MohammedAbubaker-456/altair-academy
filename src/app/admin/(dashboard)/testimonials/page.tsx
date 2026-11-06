/**
 * Admin Testimonials List Page
 *
 * Server Component fetching paginated, filtered testimonials for administrative management.
 *
 * Location: src/app/admin/(dashboard)/testimonials/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getTestimonialsAdmin } from "@/server/admin/testimonials";
import { TestimonialsManager } from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminTestimonialsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
    page?: string;
  }>;
}

export default async function AdminTestimonialsPage({ searchParams }: AdminTestimonialsPageProps) {
  const params = await searchParams;

  const page = params["page"] ? parseInt(params["page"], 10) : 1;
  const q = params["q"];
  const status = params["status"];

  const { items, total, totalPages } = await getTestimonialsAdmin({
    q,
    status,
    page: isNaN(page) ? 1 : page,
    pageSize: 10,
  });

  return (
    <TestimonialsManager
      items={items}
      total={total}
      page={isNaN(page) ? 1 : page}
      pageSize={10}
      totalPages={totalPages}
    />
  );
}
