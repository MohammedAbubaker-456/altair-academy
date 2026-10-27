/**
 * Admin Edit Course Page
 *
 * Fetches course details by ID and renders pre-populated CourseForm.
 *
 * Location: src/app/admin/(dashboard)/courses/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseByIdAdmin } from "@/server/admin/courses";
import { getAllCategoriesAdmin } from "@/server/admin/categories";
import { CourseForm } from "../CourseForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Course | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminEditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCoursePage({ params }: AdminEditCoursePageProps) {
  const { id } = await params;

  const [course, categories] = await Promise.all([getCourseByIdAdmin(id), getAllCategoriesAdmin()]);

  if (!course) {
    notFound();
  }

  return (
    <CourseForm
      initialData={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        categoryId: course.categoryId,
        level: course.level,
        duration: course.duration,
        price: course.price,
        summary: course.summary,
        image: course.image,
        objective: course.objective,
        content: course.content,
        whoShouldAttend: course.whoShouldAttend,
        certification: course.certification,
        notesAndEquipment: course.notesAndEquipment,
        classCapacity: course.classCapacity,
        feeDetails: course.feeDetails,
        courseSupport: course.courseSupport,
        isFeatured: course.isFeatured,
        order: course.order,
        status: course.status,
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
