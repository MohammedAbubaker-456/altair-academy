/**
 * Seed Data: Courses
 *
 * Initial technical training courses for database initialization.
 * All four initial courses are marked isFeatured: true for the homepage.
 *
 * Location: prisma/seed-data/courses.ts
 * Type: Seed Data Module
 */

export const seedCourses = [
  {
    slug: "visual-testing-vt",
    title: "Visual Testing (VT)",
    image: "/seed/course-ndt.jpg",
    categorySlug: "ndt",
    level: "Level 1",
    duration: "3 days · 24 hours",
    price: "Contact For Pricing",
    summary:
      "Learn surface inspection fundamentals, lighting and optics, acceptance criteria and reporting to ISO 9712 requirements.",
    isFeatured: true,
    order: 1,
  },
  {
    slug: "weld-inspection-wi",
    title: "Weld Inspection (WI)",
    image: "/seed/course-corrosion.jpg",
    categorySlug: "ndt",
    level: "Level 2",
    duration: "5 days · 40 hours",
    price: "Contact For Pricing",
    summary:
      "Weld processes, discontinuities, codes and practical assessment of welded joints for inspectors moving into supervisory work.",
    isFeatured: true,
    order: 2,
  },
  {
    slug: "iso-50001-energy-management",
    title: "ISO 50001 Energy Management Systems Awareness",
    image: "/seed/course-energy.jpg",
    categorySlug: "management-system",
    level: null,
    duration: "2 days · 16 hours",
    price: "Contact for pricing",
    summary:
      "Understand the energy management standard, baselines, performance indicators and how to run an effective internal review.",
    isFeatured: true,
    order: 3,
  },
  {
    slug: "infrastructure-asset-assessment-bim",
    title: "Introduction to Infrastructure Asset Assessment with BIM",
    image: "/seed/course-bim.jpg",
    categorySlug: "bim",
    level: null,
    duration: "4 days · 32 hours",
    price: "Contact For Pricing",
    summary:
      "Model-based asset assessment workflows, data standards and coordination practices for infrastructure teams adopting BIM.",
    isFeatured: true,
    order: 4,
  },
];
