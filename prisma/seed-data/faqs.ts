/**
 * Seed Data: FAQs
 *
 * Initial frequently asked questions for database initialization.
 *
 * Location: prisma/seed-data/faqs.ts
 * Type: Seed Data Module
 */

export const seedFaqs = [
  {
    question: "Are Altair certifications recognised by employers?",
    answer:
      "Yes. Our inspection and management system programmes follow ISO 9712, API and ISO standard syllabi, and our certificates are accepted across oil & gas, construction and manufacturing employers in the region.",
    order: 1,
  },
  {
    question: "Do I need prior experience to enrol?",
    answer:
      "Most Level 1 courses need no prior experience, only basic industry familiarity. Level 2 and supervisory tracks require documented hours, which our course managers will verify with you before enrolment.",
    order: 2,
  },
  {
    question: "Can you run a course at our own facility?",
    answer:
      "We do. In-house delivery lets us build the syllabus around your equipment, procedures and assets, and we can schedule around shift patterns.",
    order: 3,
  },
  {
    question: "What is included in the course fee?",
    answer:
      "Instruction, course materials, practical lab time, assessment and the certificate. Examination body fees, where applicable, are quoted separately so there are no surprises.",
    order: 4,
  },
  {
    question: "How do I get support after the course?",
    answer:
      "Every participant keeps access to our support desk. You can email or WhatsApp our instructors with technical questions long after your class has finished.",
    order: 5,
  },
];
