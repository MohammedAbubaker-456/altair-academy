/**
 * Admin Upcoming Intakes Server Actions
 *
 * Implements CRUD operations, optimistic status toggles, duplicating,
 * and multi-page cache revalidation for home page training intakes.
 *
 * Location: src/app/admin/intakes/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { upcomingIntakeSchema, type UpcomingIntakeInput } from "@/lib/validation/intake";
import type { Status } from "@prisma/client";

export type IntakeActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

function triggerRevalidation() {
  try {
    revalidatePath("/admin");
    revalidatePath("/admin/intakes");
    revalidatePath("/");
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn(
      "[Upcoming Intakes Actions] Revalidation notice:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function createIntake(input: unknown): Promise<IntakeActionResult> {
  await requireAdmin();

  const parseResult = upcomingIntakeSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { title, startDate, endDate, location, points, order, status } = parseResult.data;

  try {
    const intake = await db.upcomingIntake.create({
      data: {
        title,
        startDate,
        endDate,
        location,
        points,
        order,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Upcoming intake created successfully", id: intake.id };
  } catch (error) {
    console.error(
      "[createIntake] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to create upcoming intake" };
  }
}

export async function updateIntake(id: string, input: unknown): Promise<IntakeActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid intake ID format" };
  }

  const parseResult = upcomingIntakeSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { title, startDate, endDate, location, points, order, status } = parseResult.data;

  try {
    await db.upcomingIntake.update({
      where: { id },
      data: {
        title,
        startDate,
        endDate,
        location,
        points,
        order,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Upcoming intake updated successfully", id };
  } catch (error) {
    console.error(
      "[updateIntake] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to update upcoming intake" };
  }
}

export async function setIntakeStatus(id: string, status: Status): Promise<IntakeActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid intake ID format" };
  }

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    return { ok: false, message: "Invalid status value provided" };
  }

  try {
    await db.upcomingIntake.update({
      where: { id },
      data: { status },
    });

    triggerRevalidation();
    return { ok: true, message: `Upcoming intake marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error(
      "[setIntakeStatus] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to update intake status" };
  }
}

export async function deleteIntake(id: string): Promise<IntakeActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid intake ID format" };
  }

  try {
    await db.upcomingIntake.delete({
      where: { id },
    });

    triggerRevalidation();
    return { ok: true, message: "Upcoming intake deleted successfully" };
  } catch (error) {
    console.error(
      "[deleteIntake] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to delete upcoming intake" };
  }
}

export async function duplicateIntake(
  id: string,
  overrides?: Partial<UpcomingIntakeInput>,
): Promise<IntakeActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid intake ID format" };
  }

  const existing = await db.upcomingIntake.findUnique({
    where: { id },
  });

  if (!existing) {
    return { ok: false, message: "Upcoming intake not found" };
  }

  const candidate = {
    title: overrides?.title ?? existing.title,
    startDate: overrides?.startDate ?? existing.startDate,
    endDate: overrides?.endDate ?? existing.endDate,
    location: overrides?.location ?? existing.location,
    points: overrides?.points ?? existing.points,
    order: overrides?.order ?? existing.order,
    status: overrides?.status ?? "INACTIVE",
  };

  return createIntake(candidate);
}

// Action aliases for convention compatibility
export const createIntakeAction = createIntake;
export const updateIntakeAction = updateIntake;
export const setIntakeStatusAction = setIntakeStatus;
export const deleteIntakeAction = deleteIntake;
export const duplicateIntakeAction = duplicateIntake;
