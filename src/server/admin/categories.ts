/**
 * Admin Categories Data Query
 *
 * Provides administrative data access for categories with associated course counts.
 *
 * Location: src/server/admin/categories.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";

export async function getAllCategoriesAdmin() {
  await requireAdmin();

  return db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });
}

export async function getCategoryByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });
}
