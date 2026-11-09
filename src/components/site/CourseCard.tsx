/**
 * Course Card Component
 *
 * Renders an individual course preview card with image, category badge, duration, and price.
 * Supports string image URLs and provides a graceful placeholder when image is absent.
 *
 * Location: src/components/site/CourseCard.tsx
 * Type: Server Component
 */

// import Link from "next/link";
// import Image from "next/image";
// import { BookOpen, Clock, Tag } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import type { Course } from "@/data/site";

// export function CourseCard({ course }: { course: Course }) {
//   const categoryShort = course.category?.short ?? course.categorySlug;

//   return (
//     <article className="card-lift group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card">
//       <div className="aspect-[4/3] overflow-hidden bg-muted">
//         {course.image ? (
//           <Image
//             src={course.image}
//             alt={course.title}
//             width={1200}
//             height={800}
//             sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
//             className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
//           />
//         ) : (
//           <div className="flex size-full items-center justify-center bg-secondary/50 text-muted-foreground">
//             <BookOpen className="size-12 opacity-30" aria-hidden="true" />
//           </div>
//         )}
//       </div>

//       <div className="flex flex-1 flex-col p-5">
//         <h3 className="font-display text-lg leading-snug font-bold text-primary">
//           <Link
//             href={`/courses/${course.slug}`}
//             className="after:absolute after:inset-0 after:content-['']"
//           >
//             {course.title}
//           </Link>
//         </h3>

//         <div className="mt-3 flex flex-wrap items-center gap-2">
//           {categoryShort ? (
//             <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
//               {categoryShort}
//             </span>
//           ) : null}
//           {course.subcategory ? (
//             <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
//               {course.subcategory.name}
//             </span>
//           ) : null}
//           {course.level ? (
//             <span className="rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-semibold text-brand-red">
//               {course.level}
//             </span>
//           ) : null}
//         </div>

//         <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
//           {/* <div className="flex items-center gap-2">
//             <Clock className="size-4 text-primary/60" aria-hidden="true" />
//             <dt className="sr-only">Duration</dt>
//             <dd>{course.duration}</dd>
//           </div> */}
//           <div className="flex items-center gap-2">
//             <Tag className="size-4 text-primary/60" aria-hidden="true" />
//             <dt className="sr-only">Price</dt>
//             <dd>{course.price}</dd>
//           </div>
//         </dl>

//         <div className="mt-5 pt-1">
//           <Button variant="ctaOutline" size="sm" className="w-full" tabIndex={-1} asChild>
//             <span>View Course</span>
//           </Button>
//         </div>
//       </div>
//     </article>
//   );
// }



//this was the new ui i was trying
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
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import type { Course } from "@/data/site";

export function CourseCard({ course }: { course: Course }) {
  const categoryShort = course.category?.short ?? course.categorySlug;

  // `price` sometimes holds a long "send your inquiries to…" sentence — only show real prices.
  const price = course.price?.trim();
  const hasPrice = Boolean(price) && (price as string).length <= 40;

  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      {/* Red accent line that grows in on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"

      />

      {/* Image with overlaid badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            width={1200}
            height={750}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"

          />
        ) : (
          <div className="flex size-full items-center justify-center bg-secondary/50 text-muted-foreground">
            <BookOpen className="size-12 opacity-30" aria-hidden="true" />
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/60 to-transparent"
        />

        {categoryShort ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
            {categoryShort}
          </span>
        ) : null}
        {course.level ? (
          <span className="absolute right-3 top-3 rounded-full bg-brand-red px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {course.level}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {course.subcategory ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-red">
            {course.subcategory.name}
          </p>
        ) : null}

        <h3 className="mt-1.5 line-clamp-2 min-h-[3.25rem] font-display text-lg font-bold leading-snug text-primary transition-colors group-hover:text-brand-red">
          <Link
            href={`/courses/${course.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {course.title}
          </Link>
        </h3>

        {/* Meta */}
        {/* <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {course.duration ? (
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary/60" aria-hidden="true" />
              <dt className="sr-only">Duration</dt>
              <dd>{course.duration}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Tag className="size-4 text-primary/60" aria-hidden="true" />
            <dt className="sr-only">Price</dt>
            <dd className={hasPrice ? "font-semibold text-primary" : undefined}>
              {hasPrice ? price : "Enquire for fees"}
            </dd>
          </div>
        </dl> */}

        {/* Footer */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-primary transition-colors group-hover:text-brand-red">
              View course
            </span>
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-primary/8 text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-brand-red group-hover:text-white"
            >
              <Link href={`/courses/${course.slug}`}> <ArrowRight className="size-4" /> </Link>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}