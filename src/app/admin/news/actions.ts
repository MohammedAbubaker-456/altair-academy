/**
 * Admin News Posts Server Actions
 *
 * Implements CRUD operations, image cleanup, and status updates for news posts.
 *
 * Location: src/app/admin/news/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { newsPostSchema } from "@/lib/validation/news";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type NewsActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createNewsPostAction(input: unknown): Promise<NewsActionResult> {
  await requireAdmin();

  const parseResult = newsPostSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { title, slug, excerpt, body, kind, category, tags, image, publishedAt, status } =
    parseResult.data;

  try {
    const post = await db.newsPost.create({
      data: {
        title,
        slug,
        excerpt,
        body: body || null,
        kind,
        category: category || null,
        tags,
        image: image || null,
        publishedAt,
        status,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "News post created successfully", id: post.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A news post with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to create news post" };
  }
}

export async function updateNewsPostAction(id: string, input: unknown): Promise<NewsActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid news post ID" };
  }

  const parseResult = newsPostSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const existingPost = await db.newsPost.findUnique({ where: { id } });
  if (!existingPost) {
    return { ok: false, message: "News post not found" };
  }

  const { title, slug, excerpt, body, kind, category, tags, image, publishedAt, status } =
    parseResult.data;

  try {
    await db.newsPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        body: body || null,
        kind,
        category: category || null,
        tags,
        image: image || null,
        publishedAt,
        status,
      },
    });

    if (existingPost.image && existingPost.image !== image) {
      await storageService.deleteImage(existingPost.image);
    }

    revalidatePublicData();
    return { ok: true, message: "News post updated successfully", id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "A news post with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Failed to update news post" };
  }
}

export async function setNewsPostStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<NewsActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid news post ID" };
  }

  try {
    await db.newsPost.update({
      where: { id },
      data: { status },
    });
    revalidatePublicData();
    return { ok: true, message: `News post marked as ${status.toLowerCase()}` };
  } catch {
    return { ok: false, message: "Failed to update news post status" };
  }
}

export async function deleteNewsPostAction(id: string): Promise<NewsActionResult> {
  await requireAdmin();

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid news post ID" };
  }

  try {
    const post = await db.newsPost.delete({
      where: { id },
    });

    if (post.image) {
      await storageService.deleteImage(post.image);
    }

    revalidatePublicData();
    return { ok: true, message: "News post deleted successfully" };
  } catch {
    return { ok: false, message: "Failed to delete news post" };
  }
}
