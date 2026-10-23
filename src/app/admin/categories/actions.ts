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
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { categorySchema } from "@/lib/validation/category";
import { revalidatePublicData } from "@/server/revalidate";

export type CategoryActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createCategoryAction(input: unknown): Promise<CategoryActionResult> {
  await requireAdmin();

  const parseResult = categorySchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, slug, short, order, status } = parseResult.data;

  try {
    const category = await db.category.create({
      data: { name, slug, short, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "Category created successfully", id: category.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A category with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to create category" };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<CategoryActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid category ID" };
  }

  const parseResult = categorySchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A category with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to update category" };
  }
}

export async function setCategoryStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CategoryActionResult> {
  await requireAdmin();

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
  } catch {
    return { ok: false, message: "Failed to update category status" };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  await requireAdmin();

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

  try {
    await db.category.delete({
      where: { id },
    });
    revalidatePublicData();
    return { ok: true, message: "Category deleted successfully" };
  } catch {
    return { ok: false, message: "Failed to delete category" };
  }
}
