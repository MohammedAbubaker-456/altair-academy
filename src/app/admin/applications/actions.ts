/**
 * Admin Career Applications Server Actions
 *
 * Implements status changes and deletion for candidate applications.
 * Enforces admin authorization, MongoDB ObjectId format checks, path revalidation,
 * and automatic deletion of associated private resume files.
 *
 * Location: src/app/admin/applications/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { deleteResume } from "@/lib/private-storage";
import type { ApplicationStatus } from "@prisma/client";

export type ApplicationActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; authError?: boolean };

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/;

export async function setApplicationStatusAction(
  id: string,
  status: ApplicationStatus,
): Promise<ApplicationActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid application ID format" };
  }

  if (!["NEW", "REVIEWING", "SHORTLISTED", "REJECTED"].includes(status)) {
    return { ok: false, message: "Invalid application status provided" };
  }

  try {
    await db.careerApplication.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${id}`);

    return { ok: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error("[setApplicationStatusAction] Error updating status:", error);
    return { ok: false, message: "Failed to update application status" };
  }
}

export async function deleteApplicationAction(id: string): Promise<ApplicationActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid application ID format" };
  }

  try {
    const existing = await db.careerApplication.findUnique({
      where: { id },
      select: { id: true, resumeStoredName: true },
    });

    if (!existing) {
      return { ok: false, message: "Application not found" };
    }

    await db.careerApplication.delete({
      where: { id },
    });

    // Clean up stored private resume file from disk
    if (existing.resumeStoredName) {
      await deleteResume(existing.resumeStoredName);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/applications");

    return { ok: true, message: "Application and associated resume deleted successfully" };
  } catch (error) {
    console.error("[deleteApplicationAction] Error deleting application:", error);
    return { ok: false, message: "Failed to delete application" };
  }
}
