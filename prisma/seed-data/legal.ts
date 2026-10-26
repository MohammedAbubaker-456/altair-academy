/**
 * Seed Data: Legal Pages
 *
 * Core Privacy Policy and Terms of Service content with dynamic placeholders.
 *
 * Location: prisma/seed-data/legal.ts
 * Type: Seed Data Module
 */

export const seedLegalPages = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    metaDescription:
      "How Altair Academy collects, uses and protects personal data from enquiries and enrolments.",
    body: `We collect only the information needed to respond to enquiries, process enrolments and issue certificates — typically your name, employer, contact details and course history.

We do not sell personal data. Information is shared with accreditation bodies only where required to register a candidate or issue a certificate.

To request a copy, correction or deletion of your data, contact us at {{email}}.`,
    showInFooter: true,
    isCore: true,
    order: 0,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    metaDescription:
      "Enrolment, payment, rescheduling and cancellation terms for Altair Academy training courses.",
    body: `A seat is confirmed once payment or an official purchase order is received. Fees cover tuition, course material and one examination attempt unless stated otherwise.

Rescheduling is free up to 14 days before the course start date. Cancellations inside 7 days are charged at 50% of the course fee.

Altair Academy may reschedule a course if minimum enrolment is not met; in that case you may transfer to another intake or receive a full refund.`,
    showInFooter: true,
    isCore: true,
    order: 1,
  },
];
