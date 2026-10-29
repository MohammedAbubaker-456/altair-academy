/**
 * Course Card Component
 *
 * Renders an individual course preview card with image, category badge, duration, and price.
 * Supports string image URLs and provides a graceful placeholder when image is absent.
 *
 * Location: src/components/site/CourseCard.tsx
 * Type: Server Component
 */

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/data/site";

export function CourseCard({ course }: { course: Course }) {
  const categoryShort = course.category?.short ?? course.categorySlug;

  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            width={1200}
            height={800}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-secondary/50 text-muted-foreground">
            <BookOpen className="size-12 opacity-30" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug font-bold text-primary">
          <Link
            href={`/courses/${course.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {course.title}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {categoryShort ? (
            <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
              {categoryShort}
            </span>
          ) : null}
          {course.subcategory ? (
            <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
              {course.subcategory.name}
            </span>
          ) : null}
          {course.level ? (
            <span className="rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-semibold text-brand-red">
              {course.level}
            </span>
          ) : null}
        </div>

        <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary/60" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd>{course.duration}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary/60" aria-hidden="true" />
            <dt className="sr-only">Price</dt>
            <dd>{course.price}</dd>
          </div>
        </dl>

        <div className="mt-5 pt-1">
          <Button variant="ctaOutline" size="sm" className="w-full" tabIndex={-1} asChild>
            <span>View Course</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
