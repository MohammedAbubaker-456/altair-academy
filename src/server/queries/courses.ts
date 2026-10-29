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
import type { Prisma } from "@prisma/client";

function formatCourseDTO<
  T extends {
    subcategory?: { name: string; slug: string; status: "ACTIVE" | "INACTIVE" } | null;
  },
>(course: T) {
  const isSubcategoryActive = course.subcategory?.status === "ACTIVE";
  return {
    ...course,
    subcategory:
      course.subcategory && isSubcategoryActive
        ? {
            name: course.subcategory.name,
            slug: course.subcategory.slug,
          }
        : null,
  };
}

export async function getFeaturedCourses() {
  const courses = await db.course.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    include: {
      category: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          status: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return courses.map(formatCourseDTO);
}

export async function getAllActiveCourses(categorySlug?: string, subcategorySlug?: string) {
  let subcategoryIdFilter: Prisma.StringNullableFilter | string | undefined = undefined;

  if (categorySlug && subcategorySlug) {
    const cat = await db.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, status: true },
    });

    if (cat && cat.status === "ACTIVE") {
      const subcat = await db.subcategory.findFirst({
        where: {
          categoryId: cat.id,
          slug: subcategorySlug,
          status: "ACTIVE",
        },
        include: {
          children: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
      });

      if (subcat) {
        if (subcat.children.length > 0) {
          // Top-level subcategory with active children: includes courses assigned to it AND any child
          const ids = [subcat.id, ...subcat.children.map((c) => c.id)];
          subcategoryIdFilter = { in: ids };
        } else {
          // Child subcategory or standalone top-level subcategory
          subcategoryIdFilter = subcat.id;
        }
      }
    }
  }

  const where: Prisma.CourseWhereInput = {
    status: "ACTIVE",
    ...(categorySlug
      ? {
          category: {
            slug: categorySlug,
            status: "ACTIVE",
          },
        }
      : {}),
    ...(subcategoryIdFilter
      ? {
          subcategoryId: subcategoryIdFilter,
        }
      : {}),
  };

  const courses = await db.course.findMany({
    where,
    include: {
      category: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          status: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return courses.map(formatCourseDTO);
}

export async function getActiveCourseBySlug(slug: string) {
  const course = await db.course.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      category: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  if (!course) return null;
  return formatCourseDTO(course);
}

export async function searchActiveCourses(query: string) {
  const term = query.trim();
  if (!term) return [];

  const courses = await db.course.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { summary: { contains: term, mode: "insensitive" } },
        { category: { slug: { contains: term, mode: "insensitive" } } },
        { category: { name: { contains: term, mode: "insensitive" } } },
        { subcategory: { name: { contains: term, mode: "insensitive" } } },
        { subcategory: { slug: { contains: term, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          status: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
    take: 50,
  });

  return courses.map(formatCourseDTO);
}
