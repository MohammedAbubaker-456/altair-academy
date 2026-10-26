/**
 * Admin Careers Server Actions
 *
 * Implements CRUD operations and status updates for job openings.
 *
 * Location: src/app/admin/careers/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { jobOpeningSchema } from "@/lib/validation/careers";
import { revalidatePublicData } from "@/server/revalidate";
import type { Status } from "@prisma/client";

export type CareersActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createJobOpeningAction(input: unknown): Promise<CareersActionResult> {
  await requireAdmin();

  const parseResult = jobOpeningSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { title, employmentType, location, scope, summary, order, status } = parseResult.data;

  try {
    const job = await db.jobOpening.create({
      data: {
        title,
        employmentType,
        location,
        scope,
        summary,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Job opening created successfully", id: job.id };
  } catch (error) {
    console.error("Failed to create job opening:", error);
    return { ok: false, message: "Failed to create job opening" };
  }
}

export async function updateJobOpeningAction(
  id: string,
  input: unknown,
): Promise<CareersActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid job opening ID" };
  }

  const parseResult = jobOpeningSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const existing = await db.jobOpening.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Job opening not found" };
  }

  const { title, employmentType, location, scope, summary, order, status } = parseResult.data;

  try {
    await db.jobOpening.update({
      where: { id },
      data: {
        title,
        employmentType,
        location,
        scope,
        summary,
        order,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Job opening updated successfully" };
  } catch (error) {
    console.error("Failed to update job opening:", error);
    return { ok: false, message: "Failed to update job opening" };
  }
}

export async function deleteJobOpeningAction(id: string): Promise<CareersActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid job opening ID" };
  }

  const existing = await db.jobOpening.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, message: "Job opening not found" };
  }

  try {
    await db.jobOpening.delete({ where: { id } });
    revalidatePublicData();
    return { ok: true, message: "Job opening deleted successfully" };
  } catch (error) {
    console.error("Failed to delete job opening:", error);
    return { ok: false, message: "Failed to delete job opening" };
  }
}

export async function setJobOpeningStatusAction(
  id: string,
  status: Status,
): Promise<CareersActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid job opening ID" };
  }

  try {
    await db.jobOpening.update({
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
