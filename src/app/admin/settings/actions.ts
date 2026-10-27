/**
 * Admin Settings Server Actions
 *
 * Handles admin account updates, specifically password change with
 * current password verification and bcrypt rehashing.
 *
 * Location: src/app/admin/settings/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/auth";

export type ChangePasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function changePasswordAction(formData: unknown): Promise<ChangePasswordActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const currentAdmin = auth.admin;

  const parseResult = changePasswordSchema.safeParse(formData);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Invalid input. Please check the fields below.";
    return {
      ok: false,
      message,
      fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parseResult.data;

  try {
    const adminRecord = await db.adminUser.findUnique({
      where: { id: currentAdmin.id },
    });

    if (!adminRecord) {
      return { ok: false, message: "Admin account not found" };
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, adminRecord.passwordHash);
    if (!isCurrentValid) {
      return { ok: false, message: "Current password is incorrect" };
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db.adminUser.update({
      where: { id: currentAdmin.id },
      data: { passwordHash: newHash },
    });

    return { ok: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("[changePasswordAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update password" };
  }
}
