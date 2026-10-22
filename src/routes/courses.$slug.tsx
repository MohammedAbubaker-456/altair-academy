import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Tag } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { categories, courses } from "@/data/site";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = courses.find((c) => c.slug === params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Course unavailable — Altair Academy" }, { name: "robots", content: "noindex" }],
      };
    }
    const { course } = loaderData;
    return {
      meta: [
        { title: `${course.title} — Altair Academy` },
        { name: "description", content: course.summary },
        { property: "og:title", content: `${course.title} — Altair Academy` },
        { property: "og:description", content: course.summary },
      ],
    };
  },
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const category = categories.find((c) => c.slug === course.categorySlug);

  return (
    <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <img
            src={course.image}
            alt={course.title}
            loading="lazy"
            width={1200}
            height={800}
            className="w-full rounded-lg object-cover"
          />
          <p className="mt-6 text-base text-muted-foreground">{course.summary}</p>
        </div>
        <aside className="h-fit rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap gap-2">
            {category ? (
              <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                {category.short}
              </span>
            ) : null}
            {course.level ? (
              <span className="rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-semibold text-brand-red">
                {course.level}
              </span>
            ) : null}
          </div>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary/60" aria-hidden="true" />
              {course.duration}
            </li>
            <li className="flex items-center gap-2">
              <Tag className="size-4 text-primary/60" aria-hidden="true" />
              {course.price}
            </li>
          </ul>
          <Button variant="cta" className="mt-6 w-full" asChild>
            <Link to="/contact">Enroll Now</Link>
          </Button>
        </aside>
      </div>
    </PageShell>
  );
}
