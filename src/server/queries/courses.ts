/**
 * Public Queries: Courses
 *
 * Fetches active courses, featured courses, course details, and handles catalog search.
 * Strictly filters by status: ACTIVE and sorts by display order.
 *
 * Location: src/server/queries/courses.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export async function getFeaturedCourses() {
  return db.course.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getAllActiveCourses(categorySlug?: string) {
  return db.course.findMany({
    where: {
      status: "ACTIVE",
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
              status: "ACTIVE",
            },
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getActiveCourseBySlug(slug: string) {
  return db.course.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      category: true,
    },
  });
}

export async function searchActiveCourses(query: string) {
  const term = query.trim();
  if (!term) return [];

  return db.course.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { summary: { contains: term, mode: "insensitive" } },
        { category: { slug: { contains: term, mode: "insensitive" } } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
    },
    orderBy: {
      order: "asc",
    },
    take: 50,
  });
}
