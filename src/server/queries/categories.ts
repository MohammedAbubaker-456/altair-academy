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

export interface SubcategoryDTO {
  id: string;
  slug: string;
  name: string;
  order: number;
  parentId: string | null;
  children?: SubcategoryDTO[];
}

export interface CategoryTreeDTO {
  id: string;
  slug: string;
  name: string;
  short: string;
  order: number;
  subcategories: SubcategoryDTO[];
}

export async function getCategoryTree(): Promise<CategoryTreeDTO[]> {
  const [categories, subcategories] = await Promise.all([
    db.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        short: true,
        order: true,
      },
    }),
    db.subcategory.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        parentId: true,
        categoryId: true,
      },
    }),
  ]);

  return categories.map((cat) => {
    const catSubs = subcategories.filter((s) => s.categoryId === cat.id);
    const topLevels = catSubs.filter((s) => !s.parentId);

    const treeSubs: SubcategoryDTO[] = topLevels.map((top) => {
      const children = catSubs
        .filter((s) => s.parentId === top.id)
        .map((child) => ({
          id: child.id,
          slug: child.slug,
          name: child.name,
          order: child.order,
          parentId: child.parentId,
        }));

      return {
        id: top.id,
        slug: top.slug,
        name: top.name,
        order: top.order,
        parentId: null,
        children: children.length > 0 ? children : undefined,
      };
    });

    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      short: cat.short,
      order: cat.order,
      subcategories: treeSubs,
    };
  });
}
