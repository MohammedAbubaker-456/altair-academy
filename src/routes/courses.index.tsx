import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { CourseCard } from "@/components/site/CourseCard";
import { categories, courses } from "@/data/site";
import { cn } from "@/lib/utils";

type CoursesSearch = { category?: string | undefined };

export const Route = createFileRoute("/courses/")({
  validateSearch: (search: Record<string, unknown>): CoursesSearch => ({
    category: typeof search['category'] === "string" ? (search['category'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Technical Training Courses — Altair Academy" },
      {
        name: "description",
        content:
          "Browse Altair Academy courses across NDT, corrosion, BIM, management systems, plant maintenance and more.",
      },
      { property: "og:title", content: "Technical Training Courses — Altair Academy" },
      {
        property: "og:description",
        content: "Browse accredited technical courses by category, level, duration and price.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { category } = Route.useSearch();
  const filtered = category ? courses.filter((c) => c.categorySlug === category) : courses;
  const activeName = categories.find((c) => c.slug === category)?.name;

  return (
    <PageShell
      eyebrow="Our Courses"
      title={activeName ?? "All Courses"}
      intro="Accredited, practitioner-led training across inspection, integrity and management systems."
    >
      <div className="flex flex-wrap gap-2">
        <Link
          to="/courses"
          search={{}}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !category
              ? "border-brand-red bg-brand-red text-brand-red-foreground"
              : "border-border text-primary hover:border-brand-red hover:text-brand-red",
          )}
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item.slug}
            to="/courses"
            search={{ category: item.slug }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === item.slug
                ? "border-brand-red bg-brand-red text-brand-red-foreground"
                : "border-border text-primary hover:border-brand-red hover:text-brand-red",
            )}
          >
            {item.name}
          </Link>
        ))}
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
