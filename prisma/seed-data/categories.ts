/**
 * Seed Data: Categories
 *
 * Predefined training course categories for database initialization.
 * Used by prisma/seed.ts.
 *
 * Location: prisma/seed-data/categories.ts
 * Type: Seed Data Module
 */

export const seedCategories = [
  { slug: "api-icp", name: "API-ICP Exam Preparatory", short: "API-ICP", order: 1 },
  { slug: "bim", name: "Building Information Modelling (BIM)", short: "BIM", order: 2 },
  { slug: "corrosion", name: "Corrosion", short: "Corrosion", order: 3 },
  { slug: "food-beverage", name: "Food & Beverage (F&B)", short: "F&B", order: 4 },
  {
    slug: "office-productivity",
    name: "Office Productivity",
    short: "Office Productivity",
    order: 5,
  },
  { slug: "management-system", name: "Management System", short: "Management System", order: 6 },
  { slug: "ndt", name: "Non-Destructive Testing", short: "NDT", order: 7 },
  { slug: "plant-maintenance", name: "Plant Maintenance", short: "Plant Maintenance", order: 8 },
  { slug: "quality", name: "Quality", short: "Quality", order: 9 },
];
