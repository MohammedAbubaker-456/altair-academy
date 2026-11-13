/**
 * Admin Team Members Server Actions
 *
 * Implements CRUD operations, image cleanup, and status updates for team and instructors.
 *
 * Location: src/app/admin/team/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { writeList } from "@/lib/lists";
import { teamMemberSchema } from "@/lib/validation/team";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type TeamActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createTeamMemberAction(input: unknown): Promise<TeamActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = teamMemberSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const {
    name,
    slug,
    role,
    shortBio,
    instructorName,
    instructorRole,
    fullBio,
    expertise,
    image,
    placements,
    managementOrder,
    instructorOrder,
    status,
    metaTitle,
    metaDescription,
  } = parseResult.data;

  try {
    const member = await db.teamMember.create({
      data: {
        name,
        slug,
        role,
        shortBio,
        instructorName: instructorName || null,
        instructorRole: instructorRole || null,
        fullBio: fullBio || null,
        expertise: writeList(expertise),
        image: image || null,
        showInManagement: placements.includes("MANAGEMENT"),
        showInInstructors: placements.includes("INSTRUCTOR"),
        managementOrder,
        instructorOrder,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Team member created successfully", id: member.id };
  } catch (error) {
    console.error("[createTeamMemberAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a team member with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create team member" };
  }
}

export async function updateTeamMemberAction(
  id: string,
  input: unknown,
): Promise<TeamActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid team member ID" };
  }

  const parseResult = teamMemberSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const existingMember = await db.teamMember.findUnique({ where: { id } });
  if (!existingMember) {
    return { ok: false, message: "Team member not found" };
  }

  const {
    name,
    slug,
    role,
    shortBio,
    instructorName,
    instructorRole,
    fullBio,
    expertise,
    image,
    placements,
    managementOrder,
    instructorOrder,
    status,
    metaTitle,
    metaDescription,
  } = parseResult.data;

  try {
    await db.teamMember.update({
      where: { id },
      data: {
        name,
        slug,
        role,
        shortBio,
        instructorName: instructorName || null,
        instructorRole: instructorRole || null,
        fullBio: fullBio || null,
        expertise: writeList(expertise),
        image: image || null,
        showInManagement: placements.includes("MANAGEMENT"),
        showInInstructors: placements.includes("INSTRUCTOR"),
        managementOrder,
        instructorOrder,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    if (existingMember.image && existingMember.image !== image) {
      await storageService.deleteImage(existingMember.image);
    }

    revalidatePublicData();
    return { ok: true, message: "Team member updated successfully", id };
  } catch (error) {
    console.error("[updateTeamMemberAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a team member with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update team member" };
  }
}

export async function setTeamMemberStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<TeamActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid team member ID" };
  }

  try {
    await db.teamMember.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return { ok: true, message: `Team member marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error("[setTeamMemberStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update team member status" };
  }
}

export async function deleteTeamMemberAction(id: string): Promise<TeamActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid team member ID" };
  }

  try {
    const member = await db.teamMember.delete({
      where: { id },
    });

    if (member.image) {
      await storageService.deleteImage(member.image);
    }

    revalidatePublicData();
    return { ok: true, message: "Team member deleted successfully" };
  } catch (error) {
    console.error("[deleteTeamMemberAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete team member" };
  }
}
