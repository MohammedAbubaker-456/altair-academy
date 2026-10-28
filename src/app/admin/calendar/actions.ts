/**
 * Admin Calendar Server Actions
 *
 * Implements CRUD actions, status updates, and session duplication for
 * training calendar courses and scheduled intake sessions.
 *
 * Location: src/app/admin/calendar/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import {
  calendarCourseSchema,
  calendarSessionSchema,
  type CalendarCourseInput,
  type CalendarSessionInput,
} from "@/lib/validation/calendar";
import { revalidatePublicData } from "@/server/revalidate";

export type CalendarActionResult<T = unknown> =
  | { ok: true; message: string; id?: string; data?: T }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

function triggerRevalidation() {
  revalidatePublicData();
  try {
    revalidatePath("/calendar");
    revalidatePath("/admin/calendar");
  } catch (error) {
    console.warn("[calendar actions] Revalidation warning:", error);
  }
}

// -----------------------------------------------------------------------------
// Calendar Courses Server Actions
// -----------------------------------------------------------------------------

export async function createCourseAction(input: unknown): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = calendarCourseSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { code, name, order, status } = parseResult.data;

  try {
    const course = await db.calendarCourse.create({
      data: { code, name, order, status },
    });
    triggerRevalidation();
    return { ok: true, message: `Course code ${code} created successfully`, id: course.id };
  } catch (error) {
    console.error("[createCourseAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: `Course code "${code}" already exists`,
        fieldErrors: { code: ["This course code is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create course code" };
  }
}

export async function updateCourseAction(
  id: string,
  input: unknown,
): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  const parseResult = calendarCourseSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { code, name, order, status } = parseResult.data;

  try {
    await db.calendarCourse.update({
      where: { id },
      data: { code, name, order, status },
    });
    triggerRevalidation();
    return { ok: true, message: `Course code ${code} updated successfully`, id };
  } catch (error) {
    console.error("[updateCourseAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: `Course code "${code}" already exists`,
        fieldErrors: { code: ["This course code is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update course code" };
  }
}

export async function setCourseStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  try {
    await db.calendarCourse.update({
      where: { id },
      data: { status },
    });
    triggerRevalidation();
    return { ok: true, message: `Course marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("[setCourseStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update course status" };
  }
}

export async function deleteCourseAction(id: string): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid course ID" };
  }

  try {
    const sessionCount = await db.calendarSession.count({
      where: { courseId: id },
    });

    if (sessionCount > 0) {
      return {
        ok: false,
        message: `Delete or move its ${sessionCount} session${sessionCount > 1 ? "s" : ""} first`,
      };
    }

    await db.calendarCourse.delete({
      where: { id },
    });
    triggerRevalidation();
    return { ok: true, message: "Course code deleted successfully" };
  } catch (error) {
    console.error("[deleteCourseAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete course code" };
  }
}

// -----------------------------------------------------------------------------
// Calendar Sessions Server Actions
// -----------------------------------------------------------------------------

export async function createSessionAction(input: unknown): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = calendarSessionSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { courseId, kind, level, startDate, endDate, timeLabel, location, note, status } =
    parseResult.data;

  const cleanLevel = level?.trim() ? level.trim() : null;
  const cleanTimeLabel = timeLabel?.trim() ? timeLabel.trim() : null;
  const cleanLocation = location?.trim() ? location.trim() : null;
  const cleanNote = note?.trim() ? note.trim() : null;

  try {
    // Verify referenced course exists
    const courseExists = await db.calendarCourse.findUnique({
      where: { id: courseId },
      select: { id: true, code: true },
    });
    if (!courseExists) {
      return {
        ok: false,
        message: "Selected course does not exist",
        fieldErrors: { courseId: ["Course not found"] },
      };
    }

    const session = await db.calendarSession.create({
      data: {
        courseId,
        kind,
        level: cleanLevel,
        startDate,
        endDate,
        timeLabel: cleanTimeLabel,
        location: cleanLocation,
        note: cleanNote,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Session created successfully", id: session.id };
  } catch (error) {
    console.error("[createSessionAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "This session already exists",
        fieldErrors: {
          startDate: ["This session already exists"],
        },
      };
    }
    return { ok: false, message: "Database error: failed to create session" };
  }
}

export async function updateSessionAction(
  id: string,
  input: unknown,
): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid session ID" };
  }

  const parseResult = calendarSessionSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { courseId, kind, level, startDate, endDate, timeLabel, location, note, status } =
    parseResult.data;

  const cleanLevel = level?.trim() ? level.trim() : null;
  const cleanTimeLabel = timeLabel?.trim() ? timeLabel.trim() : null;
  const cleanLocation = location?.trim() ? location.trim() : null;
  const cleanNote = note?.trim() ? note.trim() : null;

  try {
    const courseExists = await db.calendarCourse.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!courseExists) {
      return {
        ok: false,
        message: "Selected course does not exist",
        fieldErrors: { courseId: ["Course not found"] },
      };
    }

    await db.calendarSession.update({
      where: { id },
      data: {
        courseId,
        kind,
        level: cleanLevel,
        startDate,
        endDate,
        timeLabel: cleanTimeLabel,
        location: cleanLocation,
        note: cleanNote,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Session updated successfully", id };
  } catch (error) {
    console.error("[updateSessionAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "This session already exists",
        fieldErrors: {
          startDate: ["This session already exists"],
        },
      };
    }
    return { ok: false, message: "Database error: failed to update session" };
  }
}

export async function setSessionStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid session ID" };
  }

  try {
    await db.calendarSession.update({
      where: { id },
      data: { status },
    });
    triggerRevalidation();
    return { ok: true, message: `Session marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("[setSessionStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update session status" };
  }
}

export async function deleteSessionAction(id: string): Promise<CalendarActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid session ID" };
  }

  try {
    await db.calendarSession.delete({
      where: { id },
    });
    triggerRevalidation();
    return { ok: true, message: "Session deleted successfully" };
  } catch (error) {
    console.error("[deleteSessionAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete session" };
  }
}

export async function duplicateSessionAction(
  id: string,
): Promise<CalendarActionResult<Partial<CalendarSessionInput>>> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid session ID" };
  }

  try {
    const session = await db.calendarSession.findUnique({
      where: { id },
    });

    if (!session) {
      return { ok: false, message: "Source session not found" };
    }

    return {
      ok: true,
      message: "Session loaded for duplication",
      data: {
        courseId: session.courseId,
        kind: session.kind,
        level: session.level,
        timeLabel: session.timeLabel,
        location: session.location,
        note: session.note,
        status: session.status,
      },
    };
  } catch (error) {
    console.error("[duplicateSessionAction] Database error:", error);
    return { ok: false, message: "Database error: failed to load session for duplication" };
  }
}
