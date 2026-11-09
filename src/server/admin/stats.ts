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
import { getTodayDateString } from "@/lib/date";
import { ALL_REGISTRY_KEYS } from "@/lib/seo/registry";

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
  testimonials: EntityCount;
  careers: EntityCount;
  contact: EntityCount;
  legal: EntityCount;
  leads: {
    total: number;
    new: number;
  };
  applications: {
    total: number;
    new: number;
  };
  subscribers: {
    total: number;
    active: number;
  };
  calendar: {
    coursesTotal: number;
    coursesActive: number;
    sessionsTotal: number;
    sessionsActive: number;
    upcomingActiveSessions: number;
  };
  intakes: {
    total: number;
    active: number;
    inactive: number;
    upcomingActive: number;
    past: number;
  };
  seo: {
    customized: number;
    total: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const today = getTodayDateString("Asia/Kuala_Lumpur");

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
    testimonialsTotal,
    testimonialsActive,
    careersTotal,
    careersActive,
    contactTotal,
    contactActive,
    legalTotal,
    legalActive,
    leadsTotal,
    leadsNew,
    applicationsTotal,
    applicationsNew,
    subscribersTotal,
    subscribersActive,
    calendarCoursesTotal,
    calendarCoursesActive,
    calendarSessionsTotal,
    calendarSessionsActive,
    upcomingActiveSessions,
    intakesTotal,
    intakesActive,
    intakesUpcomingActive,
    intakesPast,
    seoCustomized,
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
    db.testimonial.count(),
    db.testimonial.count({ where: { status: "ACTIVE" } }),
    db.jobOpening.count(),
    db.jobOpening.count({ where: { status: "ACTIVE" } }),
    db.contactDetail.count(),
    db.contactDetail.count({ where: { status: "ACTIVE" } }),
    db.legalPage.count(),
    db.legalPage.count({ where: { status: "ACTIVE" } }),
    db.lead.count(),
    db.lead.count({ where: { status: "NEW" } }),
    db.careerApplication.count(),
    db.careerApplication.count({ where: { status: "NEW" } }),
    db.newsletterSubscriber.count(),
    db.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    db.calendarCourse.count(),
    db.calendarCourse.count({ where: { status: "ACTIVE" } }),
    db.calendarSession.count(),
    db.calendarSession.count({ where: { status: "ACTIVE" } }),
    db.calendarSession.count({
      where: {
        status: "ACTIVE",
        endDate: { gte: today },
      },
    }),
    db.upcomingIntake.count(),
    db.upcomingIntake.count({ where: { status: "ACTIVE" } }),
    db.upcomingIntake.count({
      where: {
        status: "ACTIVE",
        endDate: { gte: today },
      },
    }),
    db.upcomingIntake.count({
      where: {
        endDate: { lt: today },
      },
    }),
    db.pageSeo.count(),
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
    testimonials: {
      total: testimonialsTotal,
      active: testimonialsActive,
      inactive: testimonialsTotal - testimonialsActive,
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
    leads: {
      total: leadsTotal,
      new: leadsNew,
    },
    applications: {
      total: applicationsTotal,
      new: applicationsNew,
    },
    subscribers: {
      total: subscribersTotal,
      active: subscribersActive,
    },
    calendar: {
      coursesTotal: calendarCoursesTotal,
      coursesActive: calendarCoursesActive,
      sessionsTotal: calendarSessionsTotal,
      sessionsActive: calendarSessionsActive,
      upcomingActiveSessions,
    },
    intakes: {
      total: intakesTotal,
      active: intakesActive,
      inactive: intakesTotal - intakesActive,
      upcomingActive: intakesUpcomingActive,
      past: intakesPast,
    },
    seo: {
      customized: seoCustomized,
      total: ALL_REGISTRY_KEYS.length,
    },
  };
}
