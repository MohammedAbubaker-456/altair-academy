/**
 * Public Queries: Header Menu
 *
 * Server-only query to dynamically construct the hierarchical course menu
 * from database-backed active categories and active subcategories (up to 2 levels).
 *
 * Location: src/server/queries/menu.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export interface HeaderMenuItem {
  name: string;
  href: string;
  children?: HeaderMenuItem[] | undefined;
}

export async function getHeaderMenu(): Promise<HeaderMenuItem[]> {
  const [categories, subcategories] = await Promise.all([
    db.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    db.subcategory.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        parentId: true,
      },
    }),
  ]);

  return categories.map((cat) => {
    const catSubs = subcategories.filter((s) => s.categoryId === cat.id);
    const topLevelSubs = catSubs.filter((s) => !s.parentId);
    const catHref = `/courses?category=${encodeURIComponent(cat.slug)}`;

    const children: HeaderMenuItem[] = topLevelSubs.map((topSub) => {
      const topHref = `/courses?category=${encodeURIComponent(cat.slug)}&subcategory=${encodeURIComponent(topSub.slug)}`;
      const childSubs = catSubs.filter((s) => s.parentId === topSub.id);

      const grandChildren: HeaderMenuItem[] = childSubs.map((childSub) => ({
        name: childSub.name,
        href: `/courses?category=${encodeURIComponent(cat.slug)}&subcategory=${encodeURIComponent(childSub.slug)}`,
      }));

      return {
        name: topSub.name,
        href: topHref,
        ...(grandChildren.length > 0 ? { children: grandChildren } : {}),
      };
    });

    return {
      name: cat.name,
      href: catHref,
      ...(children.length > 0 ? { children } : {}),
    };
  });
}
