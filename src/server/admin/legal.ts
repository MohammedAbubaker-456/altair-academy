/**
 * Admin Legal Pages Server Queries
 *
 * Provides querying for managing core and custom legal pages.
 *
 * Location: src/server/admin/legal.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export async function getLegalPagesAdmin() {
  await requireAdmin();

  return db.legalPage.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getLegalPageById(id: string) {
  await requireAdmin();

  return db.legalPage.findUnique({
    where: { id },
  });
}
