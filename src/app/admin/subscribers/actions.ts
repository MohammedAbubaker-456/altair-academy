/**
 * Admin Newsletter Subscribers Server Actions
 *
 * Implements status updates and deletion for newsletter subscribers.
 * Enforces admin authorization, MongoDB ObjectId format validation, and path revalidation.
 *
 * Location: src/app/admin/subscribers/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { SubscriberStatus } from "@prisma/client";

export type SubscriberActionResult =
  { ok: true; message: string } | { ok: false; message: string; authError?: boolean };

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/;

/**
 * Toggles a subscriber's status between ACTIVE and UNSUBSCRIBED.
 */
export async function setSubscriberStatusAction(
  id: string,
  status: SubscriberStatus,
): Promise<SubscriberActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid subscriber ID format" };
  }

  if (!["ACTIVE", "UNSUBSCRIBED"].includes(status)) {
    return { ok: false, message: "Invalid status value provided" };
  }

  try {
    await db.newsletterSubscriber.update({
      where: { id },
      data: {
        status,
        unsubscribedAt: status === "UNSUBSCRIBED" ? new Date() : null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscribers");

    return { ok: true, message: `Subscriber marked as ${status}` };
  } catch (error) {
    console.error(
      "[setSubscriberStatusAction] Error updating status:",
      error instanceof Error ? error.message : "Database error",
    );
    return { ok: false, message: "Failed to update subscriber status" };
  }
}

/**
 * Permanently deletes a newsletter subscriber record.
 */
export async function deleteSubscriberAction(id: string): Promise<SubscriberActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid subscriber ID format" };
  }

  try {
    await db.newsletterSubscriber.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscribers");

    return { ok: true, message: "Subscriber deleted successfully" };
  } catch (error) {
    console.error(
      "[deleteSubscriberAction] Error deleting subscriber:",
      error instanceof Error ? error.message : "Database error",
    );
    return { ok: false, message: "Failed to delete subscriber" };
  }
}
