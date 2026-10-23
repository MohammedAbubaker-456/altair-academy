/**
 * Admin FAQs Server Actions
 *
 * Implements CRUD operations and status updates for FAQ entries.
 *
 * Location: src/app/admin/faqs/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { faqSchema } from "@/lib/validation/faq";
import { revalidatePublicData } from "@/server/revalidate";

export type FaqActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createFaqAction(input: unknown): Promise<FaqActionResult> {
  await requireAdmin();

  const parseResult = faqSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { question, answer, order, status } = parseResult.data;

  try {
    const faq = await db.faq.create({
      data: { question, answer, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ created successfully", id: faq.id };
  } catch {
    return { ok: false, message: "Failed to create FAQ" };
  }
}

export async function updateFaqAction(id: string, input: unknown): Promise<FaqActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid FAQ ID" };
  }

  const parseResult = faqSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { question, answer, order, status } = parseResult.data;

  try {
    await db.faq.update({
      where: { id },
      data: { question, answer, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ updated successfully", id };
  } catch {
    return { ok: false, message: "Failed to update FAQ" };
  }
}

export async function setFaqStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<FaqActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid FAQ ID" };
  }

  try {
    await db.faq.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return { ok: true, message: `FAQ marked as ${status.toLowerCase()}` };
  } catch {
    return { ok: false, message: "Failed to update FAQ status" };
  }
}

export async function deleteFaqAction(id: string): Promise<FaqActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid FAQ ID" };
  }

  try {
    await db.faq.delete({
      where: { id },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ deleted successfully" };
  } catch {
    return { ok: false, message: "Failed to delete FAQ" };
  }
}
