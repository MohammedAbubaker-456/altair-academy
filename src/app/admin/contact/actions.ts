/**
 * Admin Contact Details Server Actions
 *
 * Implements CRUD operations and status updates for contact details,
 * revalidating affected site paths.
 *
 * Location: src/app/admin/contact/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { contactDetailSchema } from "@/lib/validation/contact";
import { revalidatePublicData } from "@/server/revalidate";
import type { Status } from "@prisma/client";

export type ContactActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createContactDetailAction(input: unknown): Promise<ContactActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = contactDetailSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { type, label, value, link, order, status } = parseResult.data;

  try {
    const contact = await db.contactDetail.create({
      data: {
        type,
        label: label || null,
        value,
        link: link || null,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Contact detail created successfully", id: contact.id };
  } catch (error) {
    console.error("[createContactDetailAction] Database error:", error);
    return { ok: false, message: "Database error: failed to create contact detail" };
  }
}

export async function updateContactDetailAction(
  id: string,
  input: unknown,
): Promise<ContactActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid contact detail ID" };
  }

  const parseResult = contactDetailSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const existing = await db.contactDetail.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Contact detail not found" };
  }

  const { type, label, value, link, order, status } = parseResult.data;

  try {
    await db.contactDetail.update({
      where: { id },
      data: {
        type,
        label: label || null,
        value,
        link: link || null,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Contact detail updated successfully" };
  } catch (error) {
    console.error("[updateContactDetailAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update contact detail" };
  }
}

export async function deleteContactDetailAction(id: string): Promise<ContactActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid contact detail ID" };
  }

  const existing = await db.contactDetail.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Contact detail not found" };
  }

  try {
    await db.contactDetail.delete({ where: { id } });
    revalidatePublicData();
    return { ok: true, message: "Contact detail deleted successfully" };
  } catch (error) {
    console.error("[deleteContactDetailAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete contact detail" };
  }
}

export async function setContactDetailStatusAction(
  id: string,
  status: Status,
): Promise<ContactActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid contact detail ID" };
  }

  try {
    await db.contactDetail.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return {
      ok: true,
      message: `Status updated to ${status}`,
    };
  } catch (error) {
    console.error("[setContactDetailStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update status" };
  }
}
