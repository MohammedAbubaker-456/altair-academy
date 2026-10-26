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
  careers: EntityCount;
  contact: EntityCount;
  legal: EntityCount;
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
    careersTotal,
    careersActive,
    contactTotal,
    contactActive,
    legalTotal,
    legalActive,
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
    db.jobOpening.count(),
    db.jobOpening.count({ where: { status: "ACTIVE" } }),
    db.contactDetail.count(),
    db.contactDetail.count({ where: { status: "ACTIVE" } }),
    db.legalPage.count(),
    db.legalPage.count({ where: { status: "ACTIVE" } }),
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
    careers: {
      total: careersTotal,
      active: careersActive,
      inactive: careersTotal - careersActive,
    },
    contact: {
      total: contactTotal,
      active: contactActive,
      inactive: contactTotal - contactActive,
    },
    legal: {
      total: legalTotal,
      active: legalActive,
      inactive: legalTotal - legalActive,
    },
  };
}
