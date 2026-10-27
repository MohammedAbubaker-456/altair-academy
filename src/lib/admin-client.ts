/**
 * Admin Client Feedback Helper
 *
 * Provides unified toast feedback and automatic authentication redirect
 * handling for admin client components.
 *
 * Location: src/lib/admin-client.ts
 * Type: Client Helper
 */

import { toast } from "sonner";

export interface ActionResultLike {
  ok: boolean;
  message: string;
  authError?: boolean;
}

/**
 * Handles the result of an admin server action on the client.
 * Automatically shows success/error toast and redirects to /admin/login if the session expired.
 */
export function handleAdminActionResult(result: ActionResultLike, onSuccess?: () => void): boolean {
  if (result.ok) {
    toast.success(result.message);
    onSuccess?.();
    return true;
  }

  if (result.authError) {
    toast.error(result.message || "Session expired, please sign in again");
    window.location.href = "/admin/login";
    return false;
  }

  toast.error(result.message || "Action failed");
  return false;
}
