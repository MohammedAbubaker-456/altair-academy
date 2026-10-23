/**
 * Seed Data: News Posts
 *
 * Initial news stories, featured announcements, and picks.
 * Converted from hardcoded news arrays with parsed UTC publishedAt dates.
 *
 * Location: prisma/seed-data/news.ts
 * Type: Seed Data Module
 */

export const seedNewsPosts = [
  {
    slug: "altair-academy-renews-bindt-approved-training-organisation-status",
    title: "Altair Academy renews its BINDT-approved training organisation status",
    excerpt:
      "Our Masai centre completed its scheduled surveillance audit this month, confirming continued approval for PCN examination preparation across ultrasonic, radiographic and surface methods.",
    kind: "FEATURED" as const,
    category: "Accreditation",
    tags: [],
    image: "/seed/hero-classroom.jpg",
    publishedAt: new Date("2026-08-18T00:00:00.000Z"),
  },
  {
    slug: "new-paut-level-2-intake-opens-for-the-october-cohort",
    title: "New PAUT Level 2 intake opens for the October cohort",
    excerpt:
      "Twelve seats only, with practical assessment on live weld samples and scanner setups drawn from current client projects.",
    kind: "STORY" as const,
    category: null,
    tags: ["NDT", "Schedule"],
    image: "/seed/course-ndt.jpg",
    publishedAt: new Date("2026-08-11T00:00:00.000Z"),
  },
  {
    slug: "api-510-preparatory-course-adds-a-second-mock-exam-day",
    title: "API 510 preparatory course adds a second mock exam day",
    excerpt:
      "Candidate feedback drove an extra full-length timed paper with code navigation drills before the certification sitting.",
    kind: "STORY" as const,
    category: null,
    tags: ["API-ICP"],
    image: "/seed/course-corrosion.jpg",
    publishedAt: new Date("2026-08-02T00:00:00.000Z"),
  },
  {
    slug: "iso-50001-awareness-now-available-as-a-live-online-classroom",
    title: "ISO 50001 awareness now available as a live online classroom",
    excerpt:
      "Remote teams can join the two-day awareness programme with the same template pack and auditor Q&A as the on-site run.",
    kind: "STORY" as const,
    category: null,
    tags: ["Management Systems"],
    image: "/seed/course-energy.jpg",
    publishedAt: new Date("2026-07-24T00:00:00.000Z"),
  },
  {
    slug: "asset-assessment-with-bim-workshop-moves-to-real-project-datasets",
    title: "Asset assessment with BIM workshop moves to real project datasets",
    excerpt:
      "Participants now work through coordination and clash review using anonymised infrastructure models from regional projects.",
    kind: "STORY" as const,
    category: null,
    tags: ["BIM", "Infrastructure"],
    image: "/seed/course-bim.jpg",
    publishedAt: new Date("2026-07-09T00:00:00.000Z"),
  },
  {
    slug: "practical-laboratory-expanded-with-new-specimen-library",
    title: "Practical laboratory expanded with new specimen library",
    excerpt:
      "Additional welded, cast and corroded specimens give candidates more variety before their practical examination.",
    kind: "STORY" as const,
    category: null,
    tags: ["Centre"],
    image: "/seed/about-lab.jpg",
    publishedAt: new Date("2026-06-27T00:00:00.000Z"),
  },
  {
    slug: "two-new-practical-instructors-join-the-inspection-faculty",
    title: "Two new practical instructors join the inspection faculty",
    excerpt:
      "Both bring offshore inspection experience and will support surface method labs and candidate coaching sessions.",
    kind: "STORY" as const,
    category: null,
    tags: ["Team"],
    image: "/seed/about-team.jpg",
    publishedAt: new Date("2026-06-14T00:00:00.000Z"),
  },
  {
    slug: "how-to-build-a-competency-matrix-your-auditors-will-accept",
    title: "How to build a competency matrix your auditors will accept",
    excerpt:
      "A practical walkthrough of mapping methods, levels and renewal dates so inspection teams stay audit-ready all year.",
    kind: "PICK" as const,
    category: null,
    tags: [],
    image: "/seed/approach-classroom.jpg",
    publishedAt: new Date("2026-05-30T00:00:00.000Z"),
  },
  {
    slug: "choosing-between-pcn-and-asnt-for-your-inspection-career",
    title: "Choosing between PCN and ASNT for your inspection career",
    excerpt:
      "What each scheme expects, how employers read them and which route fits the assets you work on.",
    kind: "PICK" as const,
    category: null,
    tags: [],
    image: null,
    publishedAt: new Date("2026-05-16T00:00:00.000Z"),
  },
  {
    slug: "corrosion-under-insulation-what-field-inspectors-keep-missing",
    title: "Corrosion under insulation: what field inspectors keep missing",
    excerpt: "Case notes from refinery walkdowns and the screening techniques that catch it early.",
    kind: "PICK" as const,
    category: null,
    tags: [],
    image: null,
    publishedAt: new Date("2026-05-03T00:00:00.000Z"),
  },
  {
    slug: "preparing-for-your-practical-ndt-assessment-in-five-steps",
    title: "Preparing for your practical NDT assessment in five steps",
    excerpt:
      "Specimen handling, reporting discipline and time management advice from our assessors.",
    kind: "PICK" as const,
    category: null,
    tags: [],
    image: null,
    publishedAt: new Date("2026-04-21T00:00:00.000Z"),
  },
];
