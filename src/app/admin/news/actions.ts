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
import { verifyAdminAction } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { writeList } from "@/lib/lists";
import { newsPostSchema } from "@/lib/validation/news";
import { storageService } from "@/lib/storage";
import { revalidatePublicData } from "@/server/revalidate";

export type NewsActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; authError?: boolean; fieldErrors?: Record<string, string[]> };

export async function createNewsPostAction(input: unknown): Promise<NewsActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const parseResult = newsPostSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const {
    title,
    slug,
    excerpt,
    body,
    kind,
    category,
    tags,
    image,
    publishedAt,
    status,
    metaTitle,
    metaDescription,
    ogImage,
  } = parseResult.data;

  try {
    const post = await db.newsPost.create({
      data: {
        title,
        slug,
        excerpt,
        body: body || null,
        kind,
        category: category || null,
        tags: writeList(tags),
        image: image || null,
        publishedAt,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
      },
    });
    revalidatePublicData();
    return { ok: true, message: "News post created successfully", id: post.id };
  } catch (error) {
    console.error("[createNewsPostAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a news post with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to create news post" };
  }
}

export async function updateNewsPostAction(id: string, input: unknown): Promise<NewsActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  if (!isValidObjectId(id)) {
    return { ok: false, message: "Invalid news post ID" };
  }

  const parseResult = newsPostSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
    const message = firstError
      ? `Validation failed: ${firstError[0]} - ${firstError[1]![0]}`
      : "Validation failed";
    return { ok: false, message, fieldErrors };
  }

  const existingPost = await db.newsPost.findUnique({ where: { id } });
  if (!existingPost) {
    return { ok: false, message: "News post not found" };
  }

  const {
    title,
    slug,
    excerpt,
    body,
    kind,
    category,
    tags,
    image,
    publishedAt,
    status,
    metaTitle,
    metaDescription,
    ogImage,
  } = parseResult.data;

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
        tags: writeList(tags),
        image: image || null,
        publishedAt,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
      },
    });

    if (existingPost.image && existingPost.image !== image) {
      await storageService.deleteImage(existingPost.image);
    }

    revalidatePublicData();
    return { ok: true, message: "News post updated successfully", id };
  } catch (error) {
    console.error("[updateNewsPostAction] Database error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Duplicate slug: a news post with this slug already exists",
        fieldErrors: { slug: ["This slug is already in use"] },
      };
    }
    return { ok: false, message: "Database error: failed to update news post" };
  }
}

export async function setNewsPostStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<NewsActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

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
  } catch (error) {
    console.error("[setNewsPostStatusAction] Database error:", error);
    return { ok: false, message: "Database error: failed to update news post status" };
  }
}

export async function deleteNewsPostAction(id: string): Promise<NewsActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

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
    if (post.ogImage && post.ogImage !== post.image) {
      await storageService.deleteImage(post.ogImage);
    }

    revalidatePublicData();
    return { ok: true, message: "News post deleted successfully" };
  } catch (error) {
    console.error("[deleteNewsPostAction] Database error:", error);
    return { ok: false, message: "Database error: failed to delete news post" };
  }
}
