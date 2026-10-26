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
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { contactDetailSchema } from "@/lib/validation/contact";
import { revalidatePublicData } from "@/server/revalidate";
import type { Status } from "@prisma/client";

export type ContactActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createContactDetailAction(input: unknown): Promise<ContactActionResult> {
  await requireAdmin();

  const parseResult = contactDetailSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
    console.error("Failed to create contact detail:", error);
    return { ok: false, message: "Failed to create contact detail" };
  }
}

export async function updateContactDetailAction(
  id: string,
  input: unknown,
): Promise<ContactActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid contact detail ID" };
  }

  const parseResult = contactDetailSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
    console.error("Failed to update contact detail:", error);
    return { ok: false, message: "Failed to update contact detail" };
  }
}

export async function deleteContactDetailAction(id: string): Promise<ContactActionResult> {
  await requireAdmin();

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
    console.error("Failed to delete contact detail:", error);
    return { ok: false, message: "Failed to delete contact detail" };
  }
}

export async function setContactDetailStatusAction(
  id: string,
  status: Status,
): Promise<ContactActionResult> {
  await requireAdmin();

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
    console.error("Failed to update status:", error);
    return { ok: false, message: "Failed to update status" };
  }
}
