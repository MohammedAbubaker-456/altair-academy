/**
 * Admin News Posts Data Query
 *
 * Provides administrative data access for news posts with search and kind filtering.
 *
 * Location: src/server/admin/news.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/id";
import { readList } from "@/lib/lists";
import type { Prisma, NewsKind } from "@prisma/client";

export interface NewsAdminParams {
  q?: string | undefined;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | undefined;
  kind?: NewsKind | "ALL" | undefined;
}

export async function getNewsPostsAdmin(params: NewsAdminParams = {}) {
  await requireAdmin();

  const where: Prisma.NewsPostWhereInput = {};

  if (params.q?.trim()) {
    const query = params.q.trim();
    where.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
      { category: { contains: query } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.kind && params.kind !== "ALL") {
    where.kind = params.kind;
  }

  const posts = await db.newsPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((post) => ({
    ...post,
    tags: readList(post.tags),
  }));
}

export async function getNewsPostByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  const post = await db.newsPost.findUnique({
    where: { id },
  });

  if (!post) return null;

  return {
    ...post,
    tags: readList(post.tags),
  };
}
