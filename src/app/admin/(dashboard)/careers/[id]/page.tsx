/**
 * Admin Edit Job Opening Page
 *
 * Location: src/app/admin/(dashboard)/careers/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/id";
import { getJobOpeningById } from "@/server/admin/careers";
import { CareersForm } from "../CareersForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Job Opening | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditJobOpeningPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobOpeningPage({ params }: EditJobOpeningPageProps) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  const job = await getJobOpeningById(id);
  if (!job) {
    notFound();
  }

  return <CareersForm initialData={job} />;
}
