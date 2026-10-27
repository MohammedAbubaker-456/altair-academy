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
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { courseSchema } from "@/lib/validation/course";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type CourseActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createCourseAction(input: unknown): Promise<CourseActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = courseSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
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
    console.error("[createCourseAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a course with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create course" };
  }
}

export async function updateCourseAction(id: string, input: unknown): Promise<CourseActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  const parseResult = courseSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
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
    console.error("[updateCourseAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a course with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update course" };
  }
}

export async function setCourseStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CourseActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

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
  } catch (error) {
    console.error("[setCourseStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update course status" };
  }
}

export async function deleteCourseAction(id: string): Promise<CourseActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

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
  } catch (error) {
    console.error("[deleteCourseAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete course" };
  }
}
