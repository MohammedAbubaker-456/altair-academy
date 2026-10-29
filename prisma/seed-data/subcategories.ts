/**
 * Seed Data: Subcategories
 *
 * Predefined course subcategories hierarchical tree for database initialization.
 * Extracted from original menu structure to preserve exact names, nesting, and order.
 * Used by prisma/seed.ts.
 *
 * Location: prisma/seed-data/subcategories.ts
 * Type: Seed Data Module
 */

export interface SeedSubcategoryItem {
  name: string;
  categorySlug: string;
  children?: SeedSubcategoryItem[];
}

export const seedSubcategoryTree: SeedSubcategoryItem[] = [
  {
    name: "Office Productivity",
    categorySlug: "office-productivity",
    children: [
      { name: "Office Productivity – Beginner", categorySlug: "office-productivity" },
      { name: "Office Productivity – Intermediate", categorySlug: "office-productivity" },
    ],
  },
  {
    name: "Non-Destructive Testing",
    categorySlug: "ndt",
    children: [
      {
        name: "ASNT Courses",
        categorySlug: "ndt",
        children: [
          { name: "ASNT – Level 1", categorySlug: "ndt" },
          { name: "ASNT – Level 2", categorySlug: "ndt" },
          { name: "ASNT – Level 3", categorySlug: "ndt" },
        ],
      },
      {
        name: "PCN Courses",
        categorySlug: "ndt",
        children: [
          { name: "PCN – Level 1", categorySlug: "ndt" },
          { name: "PCN – Level 2", categorySlug: "ndt" },
          { name: "PCN – Level 3", categorySlug: "ndt" },
        ],
      },
      { name: "Special NDT Courses", categorySlug: "ndt" },
    ],
  },
];
