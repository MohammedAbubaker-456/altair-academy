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

const toNullableString = (val?: string | null) => {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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
    subcategoryId,
    level,
    duration,
    price,
    summary,
    image,
    objective,
    content,
    whoShouldAttend,
    prerequisites,
    certification,
    notesAndEquipment,
    classCapacity,
    feeDetails,
    courseSupport,
    courseNote,
    isFeatured,
    order,
    status,
    metaTitle,
    metaDescription,
    ogImage,
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

  // Verify subcategory relation if provided
  const cleanSubcategoryId = subcategoryId && subcategoryId.trim() ? subcategoryId.trim() : null;
  if (cleanSubcategoryId) {
    if (!isValidObjectId(cleanSubcategoryId)) {
      return {
        ok: false,
        message: "Invalid subcategory selected",
        fieldErrors: { subcategoryId: ["Invalid subcategory ID"] },
      };
    }

    const subcategory = await db.subcategory.findUnique({
      where: { id: cleanSubcategoryId },
    });

    if (!subcategory) {
      return {
        ok: false,
        message: "Selected subcategory does not exist",
        fieldErrors: { subcategoryId: ["Selected subcategory does not exist"] },
      };
    }

    if (subcategory.categoryId !== categoryId) {
      return {
        ok: false,
        message: "Selected subcategory does not belong to the selected category",
        fieldErrors: {
          subcategoryId: ["Subcategory does not belong to the selected category"],
        },
      };
    }
  }

  try {
    const course = await db.course.create({
      data: {
        title,
        slug,
        categoryId,
        subcategoryId: cleanSubcategoryId,
        level: toNullableString(level),
        duration,
        price,
        summary,
        image: toNullableString(image),
        objective: toNullableString(objective),
        content: toNullableString(content),
        whoShouldAttend: toNullableString(whoShouldAttend),
        prerequisites: toNullableString(prerequisites),
        certification: toNullableString(certification),
        notesAndEquipment: toNullableString(notesAndEquipment),
        classCapacity: toNullableString(classCapacity),
        feeDetails: toNullableString(feeDetails),
        courseSupport: toNullableString(courseSupport),
        courseNote: toNullableString(courseNote),
        isFeatured,
        order,
        status,
        metaTitle: toNullableString(metaTitle),
        metaDescription: toNullableString(metaDescription),
        ogImage: toNullableString(ogImage),
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
    subcategoryId,
    level,
    duration,
    price,
    summary,
    image,
    objective,
    content,
    whoShouldAttend,
    prerequisites,
    certification,
    notesAndEquipment,
    classCapacity,
    feeDetails,
    courseSupport,
    courseNote,
    isFeatured,
    order,
    status,
    metaTitle,
    metaDescription,
    ogImage,
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

  // Verify subcategory relation if provided. If category changed and no subcategory provided, nullify.
  let cleanSubcategoryId = subcategoryId && subcategoryId.trim() ? subcategoryId.trim() : null;

  if (cleanSubcategoryId) {
    if (!isValidObjectId(cleanSubcategoryId)) {
      return {
        ok: false,
        message: "Invalid subcategory selected",
        fieldErrors: { subcategoryId: ["Invalid subcategory ID"] },
      };
    }

    const subcategory = await db.subcategory.findUnique({
      where: { id: cleanSubcategoryId },
    });

    if (!subcategory) {
      return {
        ok: false,
        message: "Selected subcategory does not exist",
        fieldErrors: { subcategoryId: ["Selected subcategory does not exist"] },
      };
    }

    if (subcategory.categoryId !== categoryId) {
      return {
        ok: false,
        message: "Selected subcategory does not belong to the selected category",
        fieldErrors: {
          subcategoryId: ["Subcategory does not belong to the selected category"],
        },
      };
    }
  } else if (existingCourse.categoryId !== categoryId) {
    cleanSubcategoryId = null;
  }

  try {
    await db.course.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId,
        subcategoryId: cleanSubcategoryId,
        level: toNullableString(level),
        duration,
        price,
        summary,
        image: toNullableString(image),
        objective: toNullableString(objective),
        content: toNullableString(content),
        whoShouldAttend: toNullableString(whoShouldAttend),
        prerequisites: toNullableString(prerequisites),
        certification: toNullableString(certification),
        notesAndEquipment: toNullableString(notesAndEquipment),
        classCapacity: toNullableString(classCapacity),
        feeDetails: toNullableString(feeDetails),
        courseSupport: toNullableString(courseSupport),
        courseNote: toNullableString(courseNote),
        isFeatured,
        order,
        status,
        metaTitle: toNullableString(metaTitle),
        metaDescription: toNullableString(metaDescription),
        ogImage: toNullableString(ogImage),
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
    if (course.ogImage && course.ogImage !== course.image) {
      await storageService.deleteImage(course.ogImage);
    }

    revalidatePublicData();
    return { ok: true, message: "Course deleted successfully" };
  } catch (error) {
    console.error("[deleteCourseAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete course" };
  }
}
