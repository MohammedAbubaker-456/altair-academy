import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { CourseCard } from "@/components/site/CourseCard";
import { courses } from "@/data/site";

type SearchParams = { q?: string | undefined };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search['q'] === "string" ? (search['q'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search Courses — Altair Academy" },
      { name: "description", content: "Search Altair Academy's technical training catalogue." },
      { property: "og:title", content: "Search Courses — Altair Academy" },
      { property: "og:description", content: "Find the right accredited technical course." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const term = (q ?? "").trim().toLowerCase();
  const results = term
    ? courses.filter((course) =>
        `${course.title} ${course.summary} ${course.categorySlug}`.toLowerCase().includes(term),
      )
    : [];

  return (
    <PageShell
      eyebrow="Search"
      title={term ? `Results for “${q}”` : "Search courses"}
      intro={term ? `${results.length} course(s) found.` : "Use the search icon in the header to begin."}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </PageShell>
  );
}
