/**
 * Admin Leads Server Actions
 *
 * Implements status updates and deletion for customer enquiry leads.
 * Enforces admin authorization, MongoDB ObjectId format validation, and path revalidation.
 *
 * Location: src/app/admin/leads/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { LeadStatus } from "@prisma/client";

export type LeadActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; authError?: boolean };

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/;

export async function setLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<LeadActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid lead ID format" };
  }

  if (!["NEW", "CONTACTED", "CLOSED"].includes(status)) {
    return { ok: false, message: "Invalid status value provided" };
  }

  try {
    await db.lead.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);

    return { ok: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error("[setLeadStatusAction] Error updating lead status:", error);
    return { ok: false, message: "Failed to update lead status" };
  }
}

export async function deleteLeadAction(id: string): Promise<LeadActionResult> {
  await requireAdmin();

  if (!OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid lead ID format" };
  }

  try {
    await db.lead.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");

    return { ok: true, message: "Lead enquiry deleted successfully" };
  } catch (error) {
    console.error("[deleteLeadAction] Error deleting lead:", error);
    return { ok: false, message: "Failed to delete lead enquiry" };
  }
}
