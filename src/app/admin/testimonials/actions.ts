/**
 * Admin Testimonials Server Actions
 *
 * Implements CRUD operations, optimistic status toggles, and cache revalidation
 * for student and employer testimonials.
 *
 * Location: src/app/admin/testimonials/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { testimonialSchema } from "@/lib/validation/testimonial";
import type { Status } from "@prisma/client";

export type TestimonialActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/;

function triggerRevalidation() {
  try {
    revalidatePath("/admin");
    revalidatePath("/admin/testimonials");
    revalidatePath("/", "layout");
  } catch (error) {
    console.warn(
      "[Testimonials Actions] Revalidation notice:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function createTestimonial(input: unknown): Promise<TestimonialActionResult> {
  await requireAdmin();

  const parseResult = testimonialSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { quote, name, company, order, status } = parseResult.data;

  try {
    const testimonial = await db.testimonial.create({
      data: {
        quote,
        name,
        company: company ?? null,
        order,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Testimonial created successfully", id: testimonial.id };
  } catch (error) {
    console.error(
      "[createTestimonial] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to create testimonial" };
  }
}

export async function updateTestimonial(
  id: string,
  input: unknown,
): Promise<TestimonialActionResult> {
  await requireAdmin();

  if (!id || !OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid testimonial ID format" };
  }

  const parseResult = testimonialSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const { quote, name, company, order, status } = parseResult.data;

  try {
    await db.testimonial.update({
      where: { id },
      data: {
        quote,
        name,
        company: company ?? null,
        order,
        status,
      },
    });

    triggerRevalidation();
    return { ok: true, message: "Testimonial updated successfully", id };
  } catch (error) {
    console.error(
      "[updateTestimonial] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to update testimonial" };
  }
}

export async function setTestimonialStatus(
  id: string,
  status: Status,
): Promise<TestimonialActionResult> {
  await requireAdmin();

  if (!id || !OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid testimonial ID format" };
  }

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    return { ok: false, message: "Invalid status value provided" };
  }

  try {
    await db.testimonial.update({
      where: { id },
      data: { status },
    });

    triggerRevalidation();
    return { ok: true, message: `Testimonial marked as ${status.toLowerCase()}` };
  } catch (error) {
    console.error(
      "[setTestimonialStatus] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to update testimonial status" };
  }
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionResult> {
  await requireAdmin();

  if (!id || !OBJECT_ID_REGEX.test(id)) {
    return { ok: false, message: "Invalid testimonial ID format" };
  }

  try {
    await db.testimonial.delete({
      where: { id },
    });

    triggerRevalidation();
    return { ok: true, message: "Testimonial deleted successfully" };
  } catch (error) {
    console.error(
      "[deleteTestimonial] Database error:",
      error instanceof Error ? error.message : "Internal error",
    );
    return { ok: false, message: "Database error: failed to delete testimonial" };
  }
}

// Action aliases for convention compatibility
export const createTestimonialAction = createTestimonial;
export const updateTestimonialAction = updateTestimonial;
export const setTestimonialStatusAction = setTestimonialStatus;
export const deleteTestimonialAction = deleteTestimonial;
