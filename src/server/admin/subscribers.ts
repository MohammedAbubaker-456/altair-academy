/**
 * Admin Newsletter Subscribers Server Queries
 *
 * Provides paginated, searchable, filterable querying for newsletter subscribers
 * and summary metrics (total, active, unsubscribed, new in last 30 days).
 * Strictly enforces admin session authentication.
 *
 * Location: src/server/admin/subscribers.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { Prisma, SubscriberStatus } from "@prisma/client";

export interface GetSubscribersParams {
  q?: string | undefined;
  status?: SubscriberStatus | "ALL" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface SubscriberSummaryStats {
  total: number;
  active: number;
  unsubscribed: number;
  newLast30Days: number;
}

export async function getSubscribersAdmin(params: GetSubscribersParams = {}) {
  await requireAdmin();

  const { q, status, page = 1, pageSize = 15 } = params;
  const currentPage = Math.max(1, page);
  const take = Math.max(1, Math.min(50, pageSize));
  const skip = (currentPage - 1) * take;

  const where: Prisma.NewsletterSubscriberWhereInput = {};

  if (q && q.trim()) {
    where.email = { contains: q.trim().toLowerCase() };
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [total, items] = await Promise.all([
    db.newsletterSubscriber.count({ where }),
    db.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return {
    items,
    total,
    page: currentPage,
    pageSize: take,
    totalPages,
  };
}

export async function getSubscriberSummaryStats(): Promise<SubscriberSummaryStats> {
  await requireAdmin();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, active, unsubscribed, newLast30Days] = await Promise.all([
    db.newsletterSubscriber.count(),
    db.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    db.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    db.newsletterSubscriber.count({
      where: {
        subscribedAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  return {
    total,
    active,
    unsubscribed,
    newLast30Days,
  };
}
