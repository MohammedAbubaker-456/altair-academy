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
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.kind && params.kind !== "ALL") {
    where.kind = params.kind;
  }

  return db.newsPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getNewsPostByIdAdmin(id: string) {
  await requireAdmin();

  if (!isValidObjectId(id)) return null;

  return db.newsPost.findUnique({
    where: { id },
  });
}
