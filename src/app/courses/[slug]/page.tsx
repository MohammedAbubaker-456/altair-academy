import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Tag } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { categories, courses } from "@/data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) {
    return {
      title: "Course unavailable — Altair Academy",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${course.title} — Altair Academy`,
    description: course.summary,
    openGraph: {
      title: `${course.title} — Altair Academy`,
      description: course.summary,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const category = categories.find((c) => c.slug === course.categorySlug);

  return (
    <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Image
            src={course.image}
            alt={course.title}
            width={1200}
            height={800}
            sizes="(min-width: 1024px) 66vw, 100vw"
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
            <Link href="/contact">Enroll Now</Link>
          </Button>
        </aside>
      </div>
    </PageShell>
  );
}
