/**
 * Admin Dashboard Statistics Query
 *
 * Computes active, inactive, and total counts across all managed entities
 * for the admin overview dashboard.
 *
 * Location: src/server/admin/stats.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export interface EntityCount {
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardStats {
  courses: EntityCount;
  categories: EntityCount;
  team: EntityCount;
  news: EntityCount;
  faqs: EntityCount;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [
    coursesTotal,
    coursesActive,
    categoriesTotal,
    categoriesActive,
    teamTotal,
    teamActive,
    newsTotal,
    newsActive,
    faqsTotal,
    faqsActive,
  ] = await Promise.all([
    db.course.count(),
    db.course.count({ where: { status: "ACTIVE" } }),
    db.category.count(),
    db.category.count({ where: { status: "ACTIVE" } }),
    db.teamMember.count(),
    db.teamMember.count({ where: { status: "ACTIVE" } }),
    db.newsPost.count(),
    db.newsPost.count({ where: { status: "ACTIVE" } }),
    db.faq.count(),
    db.faq.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    courses: {
      total: coursesTotal,
      active: coursesActive,
      inactive: coursesTotal - coursesActive,
    },
    categories: {
      total: categoriesTotal,
      active: categoriesActive,
      inactive: categoriesTotal - categoriesActive,
    },
    team: {
      total: teamTotal,
      active: teamActive,
      inactive: teamTotal - teamActive,
    },
    news: {
      total: newsTotal,
      active: newsActive,
      inactive: newsTotal - newsActive,
    },
    faqs: {
      total: faqsTotal,
      active: faqsActive,
      inactive: faqsTotal - faqsActive,
    },
  };
}
