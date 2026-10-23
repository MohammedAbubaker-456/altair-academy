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
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { teamMemberSchema } from "@/lib/validation/team";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type TeamActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createTeamMemberAction(input: unknown): Promise<TeamActionResult> {
  await requireAdmin();

  const parseResult = teamMemberSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
        expertise,
        image: image || null,
        placements,
        managementOrder,
        instructorOrder,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "Team member created successfully", id: member.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A team member with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to create team member" };
  }
}

export async function updateTeamMemberAction(
  id: string,
  input: unknown,
): Promise<TeamActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid team member ID" };
  }

  const parseResult = teamMemberSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
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
        expertise,
        image: image || null,
        placements,
        managementOrder,
        instructorOrder,
        status,
      },
    });

    if (existingMember.image && existingMember.image !== image) {
      await storageService.deleteImage(existingMember.image);
    }

    revalidatePublicData();
    return { ok: true, message: "Team member updated successfully", id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A team member with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to update team member" };
  }
}

export async function setTeamMemberStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<TeamActionResult> {
  await requireAdmin();

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
  } catch {
    return { ok: false, message: "Failed to update team member status" };
  }
}

export async function deleteTeamMemberAction(id: string): Promise<TeamActionResult> {
  await requireAdmin();

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
  } catch {
    return { ok: false, message: "Failed to delete team member" };
  }
}
