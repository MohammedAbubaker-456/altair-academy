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
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { faqSchema } from "@/lib/validation/faq";
import { revalidatePublicData } from "@/server/revalidate";

export type FaqActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createFaqAction(input: unknown): Promise<FaqActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = faqSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { question, answer, order, status } = parseResult.data;

  try {
    const faq = await db.faq.create({
      data: { question, answer, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ created successfully", id: faq.id };
  } catch (error) {
    console.error("[createFaqAction] Database error:", error);
    return { ok: false, message: "Database error: failed to create FAQ" };
  }
}

export async function updateFaqAction(id: string, input: unknown): Promise<FaqActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid FAQ ID" };
  }

  const parseResult = faqSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { question, answer, order, status } = parseResult.data;

  try {
    await db.faq.update({
      where: { id },
      data: { question, answer, order, status },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ updated successfully", id };
  } catch (error) {
    console.error("[updateFaqAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update FAQ" };
  }
}

export async function setFaqStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<FaqActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

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
  } catch (error) {
    console.error("[setFaqStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update FAQ status" };
  }
}

export async function deleteFaqAction(id: string): Promise<FaqActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid FAQ ID" };
  }

  try {
    await db.faq.delete({
      where: { id },
    });
    revalidatePublicData();
    return { ok: true, message: "FAQ deleted successfully" };
  } catch (error) {
    console.error("[deleteFaqAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete FAQ" };
  }
}
