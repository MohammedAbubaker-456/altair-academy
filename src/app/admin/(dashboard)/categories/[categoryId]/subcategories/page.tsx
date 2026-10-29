/**
 * Admin Category Subcategories Management Page
 *
 * Server Component fetching subcategories for a specific category and
 * rendering the interactive SubcategoriesManager.
 *
 * Location: src/app/admin/(dashboard)/categories/[categoryId]/subcategories/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubcategoriesByCategoryAdmin } from "@/server/admin/categories";
import { SubcategoriesManager } from "./SubcategoriesManager";

export const dynamic = "force-dynamic";

interface AdminSubcategoriesPageProps {
  params: Promise<{ categoryId: string }>;
}

export async function generateMetadata({ params }: AdminSubcategoriesPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const data = await getSubcategoriesByCategoryAdmin(categoryId);

  if (!data) {
    return {
      title: "Subcategories | Altair Academy Admin",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${data.category.name} Subcategories | Altair Academy Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminSubcategoriesPage({ params }: AdminSubcategoriesPageProps) {
  const { categoryId } = await params;
  const data = await getSubcategoriesByCategoryAdmin(categoryId);

  if (!data) {
    notFound();
  }

  return <SubcategoriesManager category={data.category} subcategories={data.subcategories} />;
}
