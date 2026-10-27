/**
 * Public Course Detail Page
 *
 * Server Component rendering individual course details.
 * Fetches the active course by slug from MongoDB. Returns 404 if inactive or not found.
 *
 * Location: src/app/courses/[slug]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Tag } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { getActiveCourseBySlug } from "@/server/queries/courses";
import { getContactDetails } from "@/server/queries/contact";
import { MarkdownContent } from "@/components/site/MarkdownContent";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getActiveCourseBySlug(slug);
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
  const [course, contactDetails] = await Promise.all([
    getActiveCourseBySlug(slug),
    getContactDetails(),
  ]);
  if (!course) notFound();

  const category = course.category;
  const activeEmail = contactDetails.EMAIL[0];
  const activeWhatsapp = contactDetails.WHATSAPP[0];
  const hasFeeDetails = Boolean(course.feeDetails && course.feeDetails.trim());
  const hasInquiryContact = Boolean(activeEmail || activeWhatsapp);
  const showFeeSection = hasFeeDetails || hasInquiryContact;
  const waDigits = activeWhatsapp
    ? (activeWhatsapp.link || activeWhatsapp.value).replace(/\D/g, "")
    : "";

  return (
    <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            {course.image ? (
              <Image
                src={course.image}
                alt={course.title}
                width={1200}
                height={800}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground">
                <BookOpen className="size-16 opacity-30" aria-hidden="true" />
              </div>
            )}
            <p className="mt-6 text-base text-muted-foreground">{course.summary}</p>
          </div>

          {/* Course Details Card */}
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-primary pb-5 border-b border-border">
              Course details
            </h2>

            <div className="divide-y divide-border">
              {/* 1. Course Objective (Markdown) */}
              {course.objective && course.objective.trim() ? (
                <div className="py-6 first:pt-6">
                  <h3 className="font-display text-lg font-bold text-primary">Course Objective</h3>
                  <div className="mt-3">
                    <MarkdownContent content={course.objective} />
                  </div>
                </div>
              ) : null}

              {/* 2. Course Content (Markdown) */}
              {course.content && course.content.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Course Content</h3>
                  <div className="mt-3">
                    <MarkdownContent content={course.content} />
                  </div>
                </div>
              ) : null}

              {/* 3. Course Duration (always shown) */}
              <div className="py-6">
                <h3 className="font-display text-lg font-bold text-primary">Course Duration</h3>
                <p className="mt-3 text-base text-muted-foreground">{course.duration}</p>
              </div>

              {/* 4. Who Should Attend (Markdown, bullet list styling) */}
              {course.whoShouldAttend && course.whoShouldAttend.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Who Should Attend</h3>
                  <div className="mt-3">
                    <MarkdownContent content={course.whoShouldAttend} />
                  </div>
                </div>
              ) : null}

              {/* 5. Certification (text) */}
              {course.certification && course.certification.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Certification</h3>
                  <p className="mt-3 text-base text-muted-foreground">{course.certification}</p>
                </div>
              ) : null}

              {/* 6. Course Notes and Equipment (text) */}
              {course.notesAndEquipment && course.notesAndEquipment.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">
                    Course Notes and Equipment
                  </h3>
                  <p className="mt-3 text-base text-muted-foreground whitespace-pre-line">
                    {course.notesAndEquipment}
                  </p>
                </div>
              ) : null}

              {/* 7. Class Capacity (text) */}
              {course.classCapacity && course.classCapacity.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Class Capacity</h3>
                  <p className="mt-3 text-base text-muted-foreground">{course.classCapacity}</p>
                </div>
              ) : null}

              {/* 8. Course Fee */}
              {showFeeSection ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Course Fee</h3>
                  <div className="mt-3">
                    {hasFeeDetails ? (
                      <MarkdownContent content={course.feeDetails!} />
                    ) : (
                      <div className="space-y-2 text-base text-muted-foreground">
                        <p>Send your inquiries to:</p>
                        <ul className="space-y-1.5 pl-1">
                          {activeEmail && (
                            <li className="flex items-center gap-2">
                              <span className="font-medium text-foreground">Email:</span>
                              <a
                                href={`mailto:${activeEmail.value}`}
                                className="font-medium text-brand-red underline underline-offset-4 hover:text-brand-red/80 transition-colors"
                              >
                                {activeEmail.value}
                              </a>
                            </li>
                          )}
                          {activeWhatsapp && (
                            <li className="flex items-center gap-2">
                              <span className="font-medium text-foreground">WhatsApp:</span>
                              <a
                                href={`https://wa.me/${waDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-brand-red underline underline-offset-4 hover:text-brand-red/80 transition-colors"
                              >
                                {activeWhatsapp.value}
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* 9. Course Support (Markdown) */}
              {course.courseSupport && course.courseSupport.trim() ? (
                <div className="py-6">
                  <h3 className="font-display text-lg font-bold text-primary">Course Support</h3>
                  <div className="mt-3">
                    <MarkdownContent content={course.courseSupport} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
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
