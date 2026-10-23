/**
 * Admin Courses Server Actions
 *
 * Implements CRUD operations, image cleanup, and status updates for courses.
 *
 * Location: src/app/admin/courses/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { courseSchema } from "@/lib/validation/course";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type CourseActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createCourseAction(input: unknown): Promise<CourseActionResult> {
  await requireAdmin();

  const parseResult = courseSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    slug,
    categoryId,
    level,
    duration,
    price,
    summary,
    image,
    isFeatured,
    order,
    status,
  } = parseResult.data;

  // Verify category exists
  const categoryExists = await db.category.findUnique({
    where: { id: categoryId },
  });
  if (!categoryExists) {
    return {
      ok: false,
      message: "Selected category does not exist",
      fieldErrors: { categoryId: ["Invalid category selected"] },
    };
  }

  try {
    const course = await db.course.create({
      data: {
        title,
        slug,
        categoryId,
        level: level || null,
        duration,
        price,
        summary,
        image: image || null,
        isFeatured,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Course created successfully", id: course.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A course with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to create course" };
  }
}

export async function updateCourseAction(id: string, input: unknown): Promise<CourseActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  const parseResult = courseSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const existingCourse = await db.course.findUnique({ where: { id } });
  if (!existingCourse) {
    return { ok: false, message: "Course not found" };
  }

  const {
    title,
    slug,
    categoryId,
    level,
    duration,
    price,
    summary,
    image,
    isFeatured,
    order,
    status,
  } = parseResult.data;

  try {
    await db.course.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId,
        level: level || null,
        duration,
        price,
        summary,
        image: image || null,
        isFeatured,
        order,
        status,
      },
    });

    // If image changed, clean up previous image (best effort)
    if (existingCourse.image && existingCourse.image !== image) {
      await storageService.deleteImage(existingCourse.image);
    }

    revalidatePublicData();
    return { ok: true, message: "Course updated successfully", id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A course with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to update course" };
  }
}

export async function setCourseStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CourseActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  try {
    await db.course.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return { ok: true, message: `Course marked as ${status.toLowerCase()}` };
  } catch {
    return { ok: false, message: "Failed to update course status" };
  }
}

export async function deleteCourseAction(id: string): Promise<CourseActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  try {
    const course = await db.course.delete({
      where: { id },
    });

    if (course.image) {
      await storageService.deleteImage(course.image);
    }

    revalidatePublicData();
    return { ok: true, message: "Course deleted successfully" };
  } catch {
    return { ok: false, message: "Failed to delete course" };
  }
}
