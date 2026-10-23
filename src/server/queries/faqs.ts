/**
 * Public Queries: FAQs
 *
 * Fetches active frequently asked questions ordered by display sequence.
 *
 * Location: src/server/queries/faqs.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export async function getActiveFaqs() {
  return db.faq.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      order: "asc",
    },
  });
}
