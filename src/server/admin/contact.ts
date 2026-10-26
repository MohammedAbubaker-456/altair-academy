/**
 * Admin Contact Details Server Queries
 *
 * Provides querying for managing site contact channels and platform links.
 *
 * Location: src/server/admin/contact.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { ContactType } from "@prisma/client";

export async function getContactDetailsAdmin() {
  await requireAdmin();

  return db.contactDetail.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }],
  });
}

export async function getContactDetailById(id: string) {
  await requireAdmin();

  return db.contactDetail.findUnique({
    where: { id },
  });
}

export async function countActiveContactByType(type: ContactType): Promise<number> {
  await requireAdmin();

  return db.contactDetail.count({
    where: {
      type,
      status: "ACTIVE",
    },
  });
}
