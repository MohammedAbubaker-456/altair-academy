/**
 * Admin Courses Data Query
 *
 * Provides administrative data access for courses with filtering, pagination,
 * and category relationships.
 *
 * Location: src/server/admin/courses.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import type { Prisma } from "@prisma/client";

export interface CoursesAdminParams {
  q?: string | undefined;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | undefined;
  categoryId?: string | undefined;
  subcategoryId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export async function getCoursesAdmin(params: CoursesAdminParams = {}) {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize ?? 10));
  const skip = (page - 1) * pageSize;

  const where: Prisma.CourseWhereInput = {};

  if (params.q?.trim()) {
    const query = params.q.trim();
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.categoryId && params.categoryId !== "ALL" && isValidObjectId(params.categoryId)) {
    where.categoryId = params.categoryId;
  }

  if (
    params.subcategoryId &&
    params.subcategoryId !== "ALL" &&
    isValidObjectId(params.subcategoryId)
  ) {
    const sub = await db.subcategory.findUnique({
      where: { id: params.subcategoryId },
      include: { children: { select: { id: true } } },
    });

    if (sub) {
      if (sub.children.length > 0) {
        where.subcategoryId = { in: [sub.id, ...sub.children.map((c) => c.id)] };
      } else {
        where.subcategoryId = sub.id;
      }
    }
  }

  const [total, items] = await Promise.all([
    db.course.count({ where }),
    db.course.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCourseByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.course.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });
}
