/**
 * Admin Subcategories Server Actions
 *
 * Implements CRUD operations, status toggles, depth constraints, same-category constraints,
 * and deletion safeguards for course subcategories.
 *
 * Location: src/app/admin/categories/subcategory-actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { subcategorySchema } from "@/lib/validation/subcategory";
import { revalidatePublicData } from "@/server/revalidate";

export type SubcategoryActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createSubcategoryAction(
  categoryId: string,
  input: unknown,
): Promise<SubcategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(categoryId)) {
    return { ok: false, message: "Invalid category ID" };
  }

  const category = await db.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    return { ok: false, message: "Category does not exist" };
  }

  const parseResult = subcategorySchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { name, slug, parentId, order, status } = parseResult.data;

  // Validate parent subcategory if specified
  const cleanParentId = parentId && parentId.trim() ? parentId.trim() : null;
  if (cleanParentId) {
    if (!isValidObjectId(cleanParentId)) {
      return {
        ok: false,
        message: "Invalid parent subcategory ID",
        fieldErrors: { parentId: ["Invalid parent subcategory ID"] },
      };
    }

    const parent = await db.subcategory.findUnique({
      where: { id: cleanParentId },
    });

    if (!parent) {
      return {
        ok: false,
        message: "Selected parent subcategory does not exist",
        fieldErrors: { parentId: ["Selected parent subcategory does not exist"] },
      };
    }

    // Same-category rule
    if (parent.categoryId !== categoryId) {
      return {
        ok: false,
        message: "Parent subcategory must belong to the same category",
        fieldErrors: { parentId: ["Parent subcategory must belong to the same category"] },
      };
    }

    // Depth rule: a parent subcategory must be top-level (parentId is null)
    if (parent.parentId !== null) {
      return {
        ok: false,
        message: "A child subcategory cannot have children (maximum depth exceeded)",
        fieldErrors: { parentId: ["Selected parent is already a child subcategory"] },
      };
    }
  }

  try {
    const subcategory = await db.subcategory.create({
      data: {
        categoryId,
        parentId: cleanParentId,
        name,
        slug,
        order,
        status,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}/subcategories`);
    revalidatePublicData();

    return { ok: true, message: "Subcategory created successfully", id: subcategory.id };
  } catch (error) {
    console.error("[createSubcategoryAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a subcategory with this slug already exists in this category",
        fieldErrors: { slug: ["This slug is already in use for this category"] },
      };
    }
    return { ok: false, message: "Database error: failed to create subcategory" };
  }
}

export async function updateSubcategoryAction(
  id: string,
  input: unknown,
): Promise<SubcategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid subcategory ID" };
  }

  const existing = await db.subcategory.findUnique({
    where: { id },
    include: {
      children: { select: { id: true } },
    },
  });

  if (!existing) {
    return { ok: false, message: "Subcategory not found" };
  }

  const parseResult = subcategorySchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { name, slug, parentId, order, status } = parseResult.data;
  const cleanParentId = parentId && parentId.trim() ? parentId.trim() : null;

  // Validate parent hierarchy and rules
  if (cleanParentId) {
    if (!isValidObjectId(cleanParentId)) {
      return {
        ok: false,
        message: "Invalid parent subcategory ID",
        fieldErrors: { parentId: ["Invalid parent subcategory ID"] },
      };
    }

    if (cleanParentId === id) {
      return {
        ok: false,
        message: "A subcategory cannot be its own parent",
        fieldErrors: { parentId: ["A subcategory cannot be its own parent"] },
      };
    }

    // Depth rule: a subcategory with existing children cannot become a child
    if (existing.children.length > 0) {
      return {
        ok: false,
        message: "A subcategory that already has children cannot be nested under another parent",
        fieldErrors: {
          parentId: ["Cannot nest under a parent because this subcategory has children"],
        },
      };
    }

    const parent = await db.subcategory.findUnique({
      where: { id: cleanParentId },
    });

    if (!parent) {
      return {
        ok: false,
        message: "Selected parent subcategory does not exist",
        fieldErrors: { parentId: ["Selected parent subcategory does not exist"] },
      };
    }

    // Same category rule
    if (parent.categoryId !== existing.categoryId) {
      return {
        ok: false,
        message: "Parent subcategory must belong to the same category",
        fieldErrors: { parentId: ["Parent subcategory must belong to the same category"] },
      };
    }

    // Depth rule: parent cannot itself be a child
    if (parent.parentId !== null) {
      return {
        ok: false,
        message: "A child subcategory cannot have children (maximum depth exceeded)",
        fieldErrors: { parentId: ["Selected parent is already a child subcategory"] },
      };
    }
  }

  try {
    await db.subcategory.update({
      where: { id },
      data: {
        parentId: cleanParentId,
        name,
        slug,
        order,
        status,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${existing.categoryId}/subcategories`);
    revalidatePublicData();

    return { ok: true, message: "Subcategory updated successfully", id };
  } catch (error) {
    console.error("[updateSubcategoryAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a subcategory with this slug already exists in this category",
        fieldErrors: { slug: ["This slug is already in use for this category"] },
      };
    }
    return { ok: false, message: "Database error: failed to update subcategory" };
  }
}

export async function setSubcategoryStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<SubcategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid subcategory ID" };
  }

  try {
    const updated = await db.subcategory.update({
      where: { id },
      data: { status },
      select: { categoryId: true },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${updated.categoryId}/subcategories`);
    revalidatePublicData();

    return { ok: true, message: `Subcategory marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("[setSubcategoryStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update subcategory status" };
  }
}

export async function deleteSubcategoryAction(id: string): Promise<SubcategoryActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid subcategory ID" };
  }

  const existing = await db.subcategory.findUnique({
    where: { id },
  });

  if (!existing) {
    return { ok: false, message: "Subcategory not found" };
  }

  // Check if any courses are assigned to this subcategory
  const courseCount = await db.course.count({
    where: { subcategoryId: id },
  });

  if (courseCount > 0) {
    return {
      ok: false,
      message: `Cannot delete subcategory because ${courseCount} course(s) use this subcategory. Please reassign or delete those courses first.`,
    };
  }

  // Check if any child subcategories exist
  const childCount = await db.subcategory.count({
    where: { parentId: id },
  });

  if (childCount > 0) {
    return {
      ok: false,
      message: `Cannot delete subcategory because it has ${childCount} child subcategor(ies). Delete its child subcategories first.`,
    };
  }

  try {
    await db.subcategory.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${existing.categoryId}/subcategories`);
    revalidatePublicData();

    return { ok: true, message: "Subcategory deleted successfully" };
  } catch (error) {
    console.error("[deleteSubcategoryAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete subcategory" };
  }
}
