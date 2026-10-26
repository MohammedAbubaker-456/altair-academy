/**
 * Seed Data: Job Openings
 *
 * Initial career opportunities for NDT instructors, assessors and coordinators.
 *
 * Location: prisma/seed-data/careers.ts
 * Type: Seed Data Module
 */

import type { EmploymentType } from "@prisma/client";

export const seedJobOpenings: Array<{
  title: string;
  employmentType: EmploymentType;
  location: string;
  scope: string;
  summary: string;
  order: number;
}> = [
  {
    title: "NDT Level III Instructor",
    employmentType: "FULL_TIME",
    location: "Masai, Johor",
    scope: "UT / PAUT / TOFD",
    summary:
      "Deliver classroom and practical sessions across advanced ultrasonic methods, prepare candidates for ASNT and PCN examinations and maintain course material.",
    order: 0,
  },
  {
    title: "Radiography Instructor (RT)",
    employmentType: "FULL_TIME",
    location: "Masai, Johor",
    scope: "RT / RT-FI",
    summary:
      "Run radiographic testing and film interpretation modules, supervise exposure practicals and uphold radiation safety procedures on site.",
    order: 1,
  },
  {
    title: "Certification Assessor",
    employmentType: "CONTRACT",
    location: "Hybrid",
    scope: "Examination body",
    summary:
      "Invigilate and grade practical and theory examinations, verify candidate eligibility and keep certification records audit-ready.",
    order: 2,
  },
  {
    title: "Welding Inspection Trainer",
    employmentType: "FULL_TIME",
    location: "Masai, Johor",
    scope: "CSWIP / AWS",
    summary:
      "Coach inspectors through welding technology, codes and visual inspection workshops with hands-on weld sample assessment.",
    order: 3,
  },
  {
    title: "Training Coordinator",
    employmentType: "FULL_TIME",
    location: "Masai, Johor",
    scope: "Operations",
    summary:
      "Own the training calendar end to end — intake scheduling, candidate onboarding, venue logistics and client communication.",
    order: 4,
  },
  {
    title: "Business Development Executive",
    employmentType: "FULL_TIME",
    location: "Singapore / Johor",
    scope: "Corporate training",
    summary:
      "Grow in-house and corporate training accounts across oil & gas, marine and manufacturing clients in the region.",
    order: 5,
  },
];
