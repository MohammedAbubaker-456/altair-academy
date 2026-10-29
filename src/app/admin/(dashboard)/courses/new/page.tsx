/**
 * Admin Create Course Page
 *
 * Renders the course creation form with active categories list.
 *
 * Location: src/app/admin/(dashboard)/courses/new/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getAllCategoriesAdmin, getAllSubcategoriesAdmin } from "@/server/admin/categories";
import { CourseForm } from "../CourseForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Course | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewCoursePage() {
  const [categories, subcategories] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllSubcategoriesAdmin(),
  ]);

  return (
    <CourseForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      subcategories={subcategories}
    />
  );
}
