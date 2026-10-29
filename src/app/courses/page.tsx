/**
 * Public Courses Catalog
 *
 * Dynamic catalog page displaying active courses with category filtering via query params.
 * Loads categories and courses from MongoDB.
 *
 * Location: src/app/courses/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { CourseCard } from "@/components/site/CourseCard";
import { getAllActiveCourses } from "@/server/queries/courses";
import { getCategoryTree } from "@/server/queries/categories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Technical Training Courses — Altair Academy",
  description:
    "Browse Altair Academy courses across NDT, corrosion, BIM, management systems, plant maintenance and more.",
  openGraph: {
    title: "Technical Training Courses — Altair Academy",
    description: "Browse accredited technical courses by category, level, duration and price.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CoursesPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const rawCategory = resolvedParams["category"];
  const rawSubcategory = resolvedParams["subcategory"];

  const categorySlug = typeof rawCategory === "string" ? rawCategory.trim() : undefined;
  const subcategorySlug = typeof rawSubcategory === "string" ? rawSubcategory.trim() : undefined;

  const [categoryTree, filtered] = await Promise.all([
    getCategoryTree(),
    getAllActiveCourses(categorySlug, subcategorySlug),
  ]);

  const selectedCategory = categorySlug
    ? categoryTree.find((c) => c.slug === categorySlug)
    : undefined;

  const topLevelSubcategories = selectedCategory?.subcategories ?? [];

  // Match subcategorySlug within selectedCategory's active tree
  let activeTopSub = subcategorySlug
    ? topLevelSubcategories.find((s) => s.slug === subcategorySlug)
    : undefined;

  const activeChildSub = subcategorySlug
    ? topLevelSubcategories.flatMap((s) => s.children ?? []).find((c) => c.slug === subcategorySlug)
    : undefined;

  if (activeChildSub) {
    activeTopSub = topLevelSubcategories.find((s) => s.id === activeChildSub.parentId);
  }

  // Determine most specific active name for page title
  let pageTitle = "All Courses";
  if (activeChildSub) {
    pageTitle = activeChildSub.name;
  } else if (activeTopSub && subcategorySlug === activeTopSub.slug) {
    pageTitle = activeTopSub.name;
  } else if (selectedCategory) {
    pageTitle = selectedCategory.name;
  }

  return (
    <PageShell
      eyebrow="Our Courses"
      title={pageTitle}
      intro="Accredited, practitioner-led training across inspection, integrity and management systems."
    >
      <div className="space-y-3">
        {/* Row 1: Categories */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              !selectedCategory
                ? "border-brand-red bg-brand-red text-brand-red-foreground"
                : "border-border text-primary hover:border-brand-red hover:text-brand-red",
            )}
          >
            All
          </Link>
          {categoryTree.map((item) => (
            <Link
              key={item.slug}
              href={`/courses?category=${encodeURIComponent(item.slug)}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                selectedCategory?.slug === item.slug
                  ? "border-brand-red bg-brand-red text-brand-red-foreground"
                  : "border-border text-primary hover:border-brand-red hover:text-brand-red",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Row 2: Top-level Subcategories (shown when selected category has active subcategories) */}
        {selectedCategory && topLevelSubcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50">
            <Link
              href={`/courses?category=${encodeURIComponent(selectedCategory.slug)}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                !activeTopSub
                  ? "border-brand-red bg-brand-red text-brand-red-foreground"
                  : "border-border text-primary hover:border-brand-red hover:text-brand-red",
              )}
            >
              All {selectedCategory.name}
            </Link>
            {topLevelSubcategories.map((sub) => {
              const isActive = activeTopSub?.slug === sub.slug;
              return (
                <Link
                  key={sub.slug}
                  href={`/courses?category=${encodeURIComponent(selectedCategory.slug)}&subcategory=${encodeURIComponent(sub.slug)}`}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-brand-red bg-brand-red text-brand-red-foreground"
                      : "border-border text-primary hover:border-brand-red hover:text-brand-red",
                  )}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Row 3: Child Subcategories (shown when selected top-level subcategory has children) */}
        {selectedCategory &&
          activeTopSub &&
          activeTopSub.children &&
          activeTopSub.children.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50">
              <Link
                href={`/courses?category=${encodeURIComponent(selectedCategory.slug)}&subcategory=${encodeURIComponent(activeTopSub.slug)}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  !activeChildSub
                    ? "border-brand-red bg-brand-red text-brand-red-foreground"
                    : "border-border text-primary hover:border-brand-red hover:text-brand-red",
                )}
              >
                All {activeTopSub.name}
              </Link>
              {activeTopSub.children.map((child) => {
                const isChildActive = activeChildSub?.slug === child.slug;
                return (
                  <Link
                    key={child.slug}
                    href={`/courses?category=${encodeURIComponent(selectedCategory.slug)}&subcategory=${encodeURIComponent(child.slug)}`}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition-colors",
                      isChildActive
                        ? "border-brand-red bg-brand-red text-brand-red-foreground"
                        : "border-border text-primary hover:border-brand-red hover:text-brand-red",
                    )}
                  >
                    {child.name}
                  </Link>
                );
              })}
            </div>
          )}
      </div>

      {filtered.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-muted-foreground">
          No published courses in this category yet — contact us and we'll schedule one.
        </p>
      )}
    </PageShell>
  );
}
