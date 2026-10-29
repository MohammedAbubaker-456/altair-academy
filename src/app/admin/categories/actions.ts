/**
 * Admin Categories Server Actions
 *
 * Implements CRUD actions and status toggles for categories, preventing
 * deletion of categories with attached courses.
 *
 * Location: src/app/admin/categories/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { categorySchema } from "@/lib/validation/category";
import { revalidatePublicData } from "@/server/revalidate";

export type CategoryActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createCategoryAction(input: unknown): Promise<CategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = categorySchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { name, slug, short, order, status } = parseResult.data;

  try {
    const category = await db.category.create({
      data: { name, slug, short, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "Category created successfully", id: category.id };
  } catch (error) {
    console.error("[createCategoryAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a category with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create category" };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<CategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid category ID" };
  }

  const parseResult = categorySchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { name, slug, short, order, status } = parseResult.data;

  try {
    await db.category.update({
      where: { id },
      data: { name, slug, short, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "Category updated successfully", id };
  } catch (error) {
    console.error("[updateCategoryAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a category with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update category" };
  }
}

export async function setCategoryStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid category ID" };
  }

  try {
    await db.category.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return { ok: true, message: `Category marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("[setCategoryStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update category status" };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid category ID" };
  }

  // Check if any courses are assigned to this category
  const courseCount = await db.course.count({
    where: { categoryId: id },
  });

  if (courseCount > 0) {
    return {
      ok: false,
      message: `Cannot delete category because ${courseCount} course(s) are currently assigned to it. Please reassign or delete those courses first.`,
    };
  }

  // Check if any subcategories belong to this category
  const subcategoryCount = await db.subcategory.count({
    where: { categoryId: id },
  });

  if (subcategoryCount > 0) {
    return {
      ok: false,
      message: `Cannot delete category because ${subcategoryCount} subcategor(ies) are currently assigned to it. Please delete those subcategories first.`,
    };
  }

  try {
    await db.category.delete({
      where: { id },
    });
    revalidatePublicData();
    return { ok: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("[deleteCategoryAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete category" };
  }
}
