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
import { requireAdmin } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/auth";

export type ChangePasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function changePasswordAction(formData: unknown): Promise<ChangePasswordActionResult> {
  const currentAdmin = await requireAdmin();

  const parseResult = changePasswordSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Invalid input. Please check the fields below.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parseResult.data;

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
}
