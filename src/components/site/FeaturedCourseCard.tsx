import { Link } from "@tanstack/react-router";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, courseExtras, type Course } from "@/data/site";

export function FeaturedCourseCard({ course }: { course: Course }) {
  const category = categories.find((c) => c.slug === course.categorySlug);
  const extra = courseExtras[course.slug];

  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card sm:flex-row">
      <div className="relative sm:w-2/5">
        <div className="h-48 overflow-hidden bg-muted sm:h-full">
          <img
            src={course.image}
            alt={course.title}
            loading="lazy"
            width={1200}
            height={800}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <span className="absolute bottom-3 left-3 rounded-md bg-brand-red px-3 py-1 font-display text-sm font-bold text-brand-red-foreground shadow-sm">
          {course.price}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
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

        <h3 className="mt-3 font-display text-lg leading-snug font-bold text-primary">
          <Link
            to="/courses/$slug"
            params={{ slug: course.slug }}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {course.title}
          </Link>
        </h3>

        <ul className="mt-3 space-y-1.5">
          {(extra?.highlights ?? []).map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 text-primary/60" aria-hidden="true" />
          {course.duration}
        </div>

        {extra?.instructor ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-secondary/60 px-3 py-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-primary-foreground">
              {extra.instructor.name.charAt(0)}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-primary">{extra.instructor.name}</span>
              <span className="block text-xs text-muted-foreground">{extra.instructor.role}</span>
            </span>
          </div>
        ) : null}

        <div className="mt-5 pt-1">
          <Button variant="cta" size="default" className="w-full text-base" tabIndex={-1} asChild>
            <span>View Course</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
