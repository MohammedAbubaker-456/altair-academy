/**
 * Admin Legal Pages Server Actions
 *
 * Implements CRUD operations, core page deletion protection, and status updates for legal documents.
 *
 * Location: src/app/admin/legal/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { legalPageSchema } from "@/lib/validation/legal";
import { revalidatePublicData } from "@/server/revalidate";
import type { Status } from "@prisma/client";

export type LegalActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createLegalPageAction(input: unknown): Promise<LegalActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = legalPageSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { title, slug, metaDescription, body, showInFooter, order, status } = parseResult.data;

  // The slugs 'privacy' and 'terms' are strictly reserved for core system pages
  if (slug === "privacy" || slug === "terms") {
    return {
      ok: false,
      message: "The slugs 'privacy' and 'terms' are reserved for core system pages.",
      fieldErrors: { slug: ["This slug is reserved"] },
    };
  }

  try {
    const page = await db.legalPage.create({
      data: {
        title,
        slug,
        metaDescription: metaDescription || null,
        body,
        showInFooter,
        isCore: false,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Legal page created successfully", id: page.id };
  } catch (error) {
    console.error("[createLegalPageAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a legal page with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create legal page" };
  }
}

export async function updateLegalPageAction(
  id: string,
  input: unknown,
): Promise<LegalActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid legal page ID" };
  }

  const parseResult = legalPageSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const existing = await db.legalPage.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Legal page not found" };
  }

  const { title, slug, metaDescription, body, showInFooter, order, status } = parseResult.data;

  // Core pages cannot change their slug
  const finalSlug = existing.isCore ? existing.slug : slug;

  if (!existing.isCore && (slug === "privacy" || slug === "terms")) {
    return {
      ok: false,
      message: "The slugs 'privacy' and 'terms' are reserved for core system pages.",
      fieldErrors: { slug: ["This slug is reserved"] },
    };
  }

  try {
    await db.legalPage.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        metaDescription: metaDescription || null,
        body,
        showInFooter,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Legal page updated successfully" };
  } catch (error) {
    console.error("[updateLegalPageAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a legal page with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update legal page" };
  }
}

export async function deleteLegalPageAction(id: string): Promise<LegalActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid legal page ID" };
  }

  const existing = await db.legalPage.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Legal page not found" };
  }

  if (existing.isCore) {
    return {
      ok: false,
      message: "Core legal pages (Privacy Policy and Terms of Service) cannot be deleted.",
    };
  }

  try {
    await db.legalPage.delete({ where: { id } });
    revalidatePublicData();
    return { ok: true, message: "Legal page deleted successfully" };
  } catch (error) {
    console.error("[deleteLegalPageAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete legal page" };
  }
}

export async function setLegalPageStatusAction(
  id: string,
  status: Status,
): Promise<LegalActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid legal page ID" };
  }

  try {
    await db.legalPage.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return {
      ok: true,
      message: `Status updated to ${status}`,
    };
  } catch (error) {
    console.error("[setLegalPageStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update status" };
  }
}
