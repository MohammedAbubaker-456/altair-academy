/**
 * Public Queries: Categories
 *
 * Fetches active course categories sorted by order for public display.
 * Used on the homepage and courses catalog.
 *
 * Location: src/server/queries/categories.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export async function getActiveCategories() {
  return db.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { order: "asc" },
  });
}
