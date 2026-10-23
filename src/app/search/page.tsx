import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { CourseCard } from "@/components/site/CourseCard";
import { courses } from "@/data/site";

export const metadata: Metadata = {
  title: "Search Courses — Altair Academy",
  description: "Search Altair Academy's technical training catalogue.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Search Courses — Altair Academy",
    description: "Find the right accredited technical course.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const rawQ = resolvedParams["q"];
  const q = typeof rawQ === "string" ? rawQ : undefined;
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
