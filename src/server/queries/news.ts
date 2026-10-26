/**
 * Public Queries: News Posts
 *
 * Fetches published news feed split into featured article, regular stories, and editor picks.
 *
 * Location: src/server/queries/news.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";

export async function getNewsFeed() {
  const [featured, stories, picks] = await Promise.all([
    db.newsPost.findFirst({
      where: {
        status: "ACTIVE",
        kind: "FEATURED",
      },
      orderBy: {
        publishedAt: "desc",
      },
    }),
    db.newsPost.findMany({
      where: {
        status: "ACTIVE",
        kind: "STORY",
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 6,
    }),
    db.newsPost.findMany({
      where: {
        status: "ACTIVE",
        kind: "PICK",
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 4,
    }),
  ]);

  return {
    featured,
    stories,
    picks,
  };
}

export async function getNewsPostBySlug(slug: string) {
  return db.newsPost.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
  });
}

export async function getLatestNewsExcluding(id: string, limit = 3) {
  return db.newsPost.findMany({
    where: {
      status: "ACTIVE",
      id: {
        not: id,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}
