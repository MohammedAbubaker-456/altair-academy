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
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { legalPageSchema } from "@/lib/validation/legal";
import { revalidatePublicData } from "@/server/revalidate";
import type { Status } from "@prisma/client";

export type LegalActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createLegalPageAction(input: unknown): Promise<LegalActionResult> {
  await requireAdmin();

  const parseResult = legalPageSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A legal page with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    console.error("Failed to create legal page:", error);
    return { ok: false, message: "Failed to create legal page" };
  }
}

export async function updateLegalPageAction(
  id: string,
  input: unknown,
): Promise<LegalActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid legal page ID" };
  }

  const parseResult = legalPageSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A legal page with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    console.error("Failed to update legal page:", error);
    return { ok: false, message: "Failed to update legal page" };
  }
}

export async function deleteLegalPageAction(id: string): Promise<LegalActionResult> {
  await requireAdmin();

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
    console.error("Failed to delete legal page:", error);
    return { ok: false, message: "Failed to delete legal page" };
  }
}

export async function setLegalPageStatusAction(
  id: string,
  status: Status,
): Promise<LegalActionResult> {
  await requireAdmin();

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
    console.error("Failed to update status:", error);
    return { ok: false, message: "Failed to update status" };
  }
}
