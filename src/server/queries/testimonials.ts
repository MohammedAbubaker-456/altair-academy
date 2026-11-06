/**
 * Public Queries: Testimonials
 *
 * Fetches active testimonials ordered by display sequence and creation date.
 * Returns plain serialisable DTOs.
 *
 * Location: src/server/queries/testimonials.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export interface TestimonialDTO {
  id: string;
  quote: string;
  name: string;
  company: string | null;
}

export async function getActiveTestimonials(): Promise<TestimonialDTO[]> {
  return db.testimonial.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      quote: true,
      name: true,
      company: true,
    },
  });
}
