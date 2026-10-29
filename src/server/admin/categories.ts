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
        select: { courses: true, subcategories: true },
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
        select: { courses: true, subcategories: true },
      },
    },
  });
}

export async function getSubcategoriesByCategoryAdmin(categoryId: string) {
  await requireAdmin();

  if (!isValidObjectId(categoryId)) return null;

  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, slug: true, status: true },
  });

  if (!category) return null;

  const subcategories = await db.subcategory.findMany({
    where: { categoryId },
    orderBy: { order: "asc" },
    include: {
      parent: {
        select: { id: true, name: true },
      },
      _count: {
        select: { courses: true, children: true },
      },
    },
  });

  return {
    category,
    subcategories,
  };
}

export async function getAllSubcategoriesAdmin() {
  await requireAdmin();

  return db.subcategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      parentId: true,
      status: true,
      order: true,
    },
  });
}
