/**
 * Admin FAQs Data Query
 *
 * Provides administrative data access for FAQ entries.
 *
 * Location: src/server/admin/faqs.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";

export async function getFaqsAdmin() {
  await requireAdmin();

  return db.faq.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getFaqByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.faq.findUnique({
    where: { id },
  });
}
