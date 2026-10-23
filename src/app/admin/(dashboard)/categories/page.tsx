/**
 * Admin Categories Page
 *
 * Fetches all categories with course relation counts and renders
 * the interactive CategoriesManager.
 *
 * Location: src/app/admin/(dashboard)/categories/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getAllCategoriesAdmin } from "@/server/admin/categories";
import { CategoriesManager } from "./CategoriesManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories Management | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return <CategoriesManager categories={categories} />;
}
