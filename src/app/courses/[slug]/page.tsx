// /**
//  * Public Course Detail Page
//  *
//  * Server Component rendering individual course details.
//  * Fetches the active course by slug from MongoDB. Returns 404 if inactive or not found.
//  *
//  * Location: src/app/courses/[slug]/page.tsx
//  * Type: Server Component
//  */

// import type { Metadata } from "next";
// import Link from "next/link";
// import Image from "next/image";
// import { notFound } from "next/navigation";
// import { BookOpen, Clock, Tag } from "lucide-react";
// import { PageShell } from "@/components/site/PageShell";
// import { Button } from "@/components/ui/button";
// import { getActiveCourseBySlug } from "@/server/queries/courses";
// import { getContactDetails } from "@/server/queries/contact";
// import { MarkdownContent } from "@/components/site/MarkdownContent";

// type Props = {
//   params: Promise<{ slug: string }>;
// };

// export const dynamic = "force-dynamic";

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { slug } = await params;
//   const course = await getActiveCourseBySlug(slug);
//   if (!course) {
//     return {
//       title: "Course unavailable — Altair Academy",
//       robots: { index: false, follow: false },
//     };
//   }
//   return {
//     title: `${course.title} — Altair Academy`,
//     description: course.summary,
//     openGraph: {
//       title: `${course.title} — Altair Academy`,
//       description: course.summary,
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//     },
//   };
// }

// export default async function CourseDetailPage({ params }: Props) {
//   const { slug } = await params;
//   const [course, contactDetails] = await Promise.all([
//     getActiveCourseBySlug(slug),
//     getContactDetails(),
//   ]);
//   if (!course) notFound();

//   const category = course.category;
//   const activeEmail = contactDetails.EMAIL[0];
//   const activeWhatsapp = contactDetails.WHATSAPP[0];
//   const hasFeeDetails = Boolean(course.feeDetails && course.feeDetails.trim());
//   const hasInquiryContact = Boolean(activeEmail || activeWhatsapp);
//   const showFeeSection = hasFeeDetails || hasInquiryContact;
//   const waDigits = activeWhatsapp
//     ? (activeWhatsapp.link || activeWhatsapp.value).replace(/\D/g, "")
//     : "";

//   return (
//     <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
//       <div className="grid gap-10 lg:grid-cols-3">
//         <div className="lg:col-span-2 space-y-8">
//           <div>
//             {course.image ? (
//               <Image
//                 src={course.image}
//                 alt={course.title}
//                 width={1200}
//                 height={800}
//                 sizes="(min-width: 1024px) 66vw, 100vw"
//                 className="w-full rounded-lg object-cover"
//               />
//             ) : (
//               <div className="flex h-64 w-full items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground">
//                 <BookOpen className="size-16 opacity-30" aria-hidden="true" />
//               </div>
//             )}
//             <p className="mt-6 text-base text-muted-foreground">{course.summary}</p>
//           </div>

//           {/* Course Details Card */}
//           <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
//             <h2 className="font-display text-xl font-bold tracking-tight text-primary pb-5 border-b border-border">
//               Course details
//             </h2>

//             <div className="divide-y divide-border">
//               {/* 1. Course Objective (Markdown) */}
//               {course.objective && course.objective.trim() ? (
//                 <div className="py-6 first:pt-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Course Objective</h3>
//                   <div className="mt-3">
//                     <MarkdownContent content={course.objective} />
//                   </div>
//                 </div>
//               ) : null}

//               {/* 2. Course Content (Markdown) */}
//               {course.content && course.content.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Course Content</h3>
//                   <div className="mt-3">
//                     <MarkdownContent content={course.content} />
//                   </div>
//                 </div>
//               ) : null}

//               {/* 3. Course Duration (always shown) */}
//               <div className="py-6">
//                 <h3 className="font-display text-lg font-bold text-primary">Course Duration</h3>
//                 <p className="mt-3 text-base text-muted-foreground">{course.duration}</p>
//               </div>

//               {/* 4. Who Should Attend (Markdown, bullet list styling) */}
//               {course.whoShouldAttend && course.whoShouldAttend.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Who Should Attend</h3>
//                   <div className="mt-3">
//                     <MarkdownContent content={course.whoShouldAttend} />
//                   </div>
//                 </div>
//               ) : null}

//               {/* 5. Certification (text) */}
//               {course.certification && course.certification.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Certification</h3>
//                   <p className="mt-3 text-base text-muted-foreground">{course.certification}</p>
//                 </div>
//               ) : null}

//               {/* 6. Course Notes and Equipment (text) */}
//               {course.notesAndEquipment && course.notesAndEquipment.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">
//                     Course Notes and Equipment
//                   </h3>
//                   <p className="mt-3 text-base text-muted-foreground whitespace-pre-line">
//                     {course.notesAndEquipment}
//                   </p>
//                 </div>
//               ) : null}

//               {/* 7. Class Capacity (text) */}
//               {course.classCapacity && course.classCapacity.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Class Capacity</h3>
//                   <p className="mt-3 text-base text-muted-foreground">{course.classCapacity}</p>
//                 </div>
//               ) : null}

//               {/* 8. Course Fee */}
//               {showFeeSection ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Course Fee</h3>
//                   <div className="mt-3">
//                     {hasFeeDetails ? (
//                       <MarkdownContent content={course.feeDetails!} />
//                     ) : (
//                       <div className="space-y-2 text-base text-muted-foreground">
//                         <p>Send your inquiries to:</p>
//                         <ul className="space-y-1.5 pl-1">
//                           {activeEmail && (
//                             <li className="flex items-center gap-2">
//                               <span className="font-medium text-foreground">Email:</span>
//                               <a
//                                 href={`mailto:${activeEmail.value}`}
//                                 className="font-medium text-brand-red underline underline-offset-4 hover:text-brand-red/80 transition-colors"
//                               >
//                                 {activeEmail.value}
//                               </a>
//                             </li>
//                           )}
//                           {activeWhatsapp && (
//                             <li className="flex items-center gap-2">
//                               <span className="font-medium text-foreground">WhatsApp:</span>
//                               <a
//                                 href={`https://wa.me/${waDigits}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="font-medium text-brand-red underline underline-offset-4 hover:text-brand-red/80 transition-colors"
//                               >
//                                 {activeWhatsapp.value}
//                               </a>
//                             </li>
//                           )}
//                         </ul>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : null}

//               {/* 9. Course Support (Markdown) */}
//               {course.courseSupport && course.courseSupport.trim() ? (
//                 <div className="py-6">
//                   <h3 className="font-display text-lg font-bold text-primary">Course Support</h3>
//                   <div className="mt-3">
//                     <MarkdownContent content={course.courseSupport} />
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           </div>
//         </div>

//         <aside className="h-fit rounded-lg border border-border bg-card p-6">
//           <div className="flex flex-wrap gap-2">
//             {category ? (
//               <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
//                 {category.short}
//               </span>
//             ) : null}
//             {course.level ? (
//               <span className="rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-semibold text-brand-red">
//                 {course.level}
//               </span>
//             ) : null}
//           </div>
//           <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
//             <li className="flex items-center gap-2">
//               <Clock className="size-4 text-primary/60" aria-hidden="true" />
//               {course.duration}
//             </li>
//             <li className="flex items-center gap-2">
//               <Tag className="size-4 text-primary/60" aria-hidden="true" />
//               {course.price}
//             </li>
//           </ul>
//           <Button variant="cta" className="mt-6 w-full" asChild>
//             <Link href="/contact">Enroll Now</Link>
//           </Button>
//         </aside>
//       </div>
//     </PageShell>
//   );
// }
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
import {
  Award,
  BookOpen,
  Clock,
  ClipboardCheck,
  Info,
  LifeBuoy,
  ListChecks,
  Mail,
  MessageCircle,
  Package,
  Target,
  UserCheck,
  Users,
  Wallet,
  BarChart3,
} from "lucide-react";
import type { ReactNode } from "react";
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

/** Section block used for the long-form content in the details card. */
function DetailSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="py-7 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          {icon}
        </span>
        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
      </div>
      <div className="mt-4 sm:pl-12">{children}</div>
    </section>
  );
}

/** Small tile for the at-a-glance facts strip. */
function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <span className="mt-0.5 text-brand-red">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
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

  const has = (v?: string | null) => Boolean(v && v.trim());

  // `price` sometimes holds a long "send your inquiries" sentence — only show real prices.
  const showPrice = has(course.price) && course.price.trim().length <= 40;

  return (
    <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-8 lg:col-span-8">
          {/* Hero image: capped height so it never dominates the page */}
          <div className="relative overflow-hidden rounded-xl border border-border">
            {course.image ? (
              <Image
                src={course.image}
                alt={course.title}
                width={1200}
                height={675}
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="aspect-[16/8] w-full object-cover sm:aspect-[16/7]"
              />
              // <Image
              //   src={course.image}
              //   alt={course.title}
              //   width={1200}
              //   height={675}
              //   priority
              //   // sizes="(min-width: 1024px) 66vw, 100vw"
              //   // className="h-auto w-full object-contain"
              //   sizes="(min-width: 1024px) 56vw, 85vw"
              //   className="mx-auto h-auto w-[85%] object-contain"
              // />
            ) : (
              <div className="flex aspect-[16/8] w-full items-center justify-center bg-secondary/50 text-muted-foreground sm:aspect-[16/7]">
                <BookOpen className="size-16 opacity-30" aria-hidden="true" />
              </div>
            )}
            {/* Bottom fade + badges sitting on the image */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/70 to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {category ? (
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  {category.short}
                </span>
              ) : null}
              {course.subcategory ? (
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  {course.subcategory.name}
                </span>
              ) : null}
              {course.level ? (
                <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {course.level}
                </span>
              ) : null}
            </div>
          </div>

          {/* Summary */}
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {course.summary}
          </p>

          {/* At-a-glance facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact
              icon={<Clock className="size-5" aria-hidden="true" />}
              label="Duration"
              value={course.duration}
            />
            {has(course.classCapacity) && (
              <Fact
                icon={<Users className="size-5" aria-hidden="true" />}
                label="Class size"
                value={course.classCapacity!}
              />
            )}
            {has(course.certification) && (
              <Fact
                icon={<Award className="size-5" aria-hidden="true" />}
                label="Certification"
                value={course.certification!}
              />
            )}
            {course.level ? (
              <Fact
                icon={<BarChart3 className="size-5" aria-hidden="true" />}
                label="Level"
                value={course.level}
              />
            ) : null}
          </div>

          {/* Course details */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="pb-6 font-display text-2xl font-bold tracking-tight text-primary">
              Course details
            </h2>

            <div className="divide-y divide-border border-t border-border pt-7 [&>section:not(:first-child)]:border-t-0">
              {has(course.objective) && (
                <DetailSection
                  icon={<Target className="size-5" aria-hidden="true" />}
                  title="Course objective"
                >
                  <MarkdownContent content={course.objective!} />
                </DetailSection>
              )}

              {has(course.content) && (
                <DetailSection
                  icon={<ListChecks className="size-5" aria-hidden="true" />}
                  title="Course content"
                >
                  <MarkdownContent content={course.content!} />
                </DetailSection>
              )}

              {has(course.whoShouldAttend) && (
                <DetailSection
                  icon={<UserCheck className="size-5" aria-hidden="true" />}
                  title="Who should attend"
                >
                  <MarkdownContent content={course.whoShouldAttend!} />
                </DetailSection>
              )}

              {has(course.prerequisites) && (
                <DetailSection
                  icon={<ClipboardCheck className="size-5" aria-hidden="true" />}
                  title="Pre-requirements"
                >
                  <MarkdownContent content={course.prerequisites!} />
                </DetailSection>
              )}

              {has(course.notesAndEquipment) && (
                <DetailSection
                  icon={<Package className="size-5" aria-hidden="true" />}
                  title="Course notes and equipment"
                >
                  <p className="whitespace-pre-line text-base text-muted-foreground">
                    {course.notesAndEquipment}
                  </p>
                </DetailSection>
              )}

              {showFeeSection && (
                <DetailSection
                  icon={<Wallet className="size-5" aria-hidden="true" />}
                  title="Course fee"
                >
                  {hasFeeDetails ? (
                    <MarkdownContent content={course.feeDetails!} />
                  ) : (
                    <div className="space-y-3 text-base text-muted-foreground">
                      <p>Send your inquiries to:</p>
                      <div className="flex flex-wrap gap-3">
                        {activeEmail && (
                          <a
                            href={`mailto:${activeEmail.value}`}
                            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-brand-red hover:text-brand-red"
                          >
                            <Mail className="size-4" aria-hidden="true" />
                            {activeEmail.value}
                          </a>
                        )}
                        {activeWhatsapp && (
                          <a
                            href={`https://wa.me/${waDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-brand-red hover:text-brand-red"
                          >
                            <MessageCircle className="size-4" aria-hidden="true" />
                            {activeWhatsapp.value}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </DetailSection>
              )}

              {has(course.courseSupport) && (
                <DetailSection
                  icon={<LifeBuoy className="size-5" aria-hidden="true" />}
                  title="Course support"
                >
                  <MarkdownContent content={course.courseSupport!} />
                </DetailSection>
              )}

              {has(course.courseNote) && (
                <DetailSection
                  icon={<Info className="size-5" aria-hidden="true" />}
                  title="Note"
                >
                  <MarkdownContent content={course.courseNote!} />
                </DetailSection>
              )}
            </div>
          </div>
        </div>

        {/* ───────────── Sticky enrolment sidebar ───────────── */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="h-1.5 bg-brand-red" />
              <div className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {category ? (
                    <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                      {category.short}
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
                <p className="font-display text-lg font-bold text-primary">Reserve your seat</p>
                {showPrice && (
                  <p className="mt-1 text-2xl font-bold text-brand-red">{course.price}</p>
                )}

                <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <Clock className="size-4 text-primary/60" aria-hidden="true" />
                    {course.duration}
                  </li>
                  {has(course.classCapacity) && (
                    <li className="flex items-center gap-3">
                      <Users className="size-4 text-primary/60" aria-hidden="true" />
                      {course.classCapacity}
                    </li>
                  )}
                  {has(course.certification) && (
                    <li className="flex items-center gap-3">
                      <Award className="size-4 text-primary/60" aria-hidden="true" />
                      {course.certification}
                    </li>
                  )}
                </ul>

                <Button variant="cta" className="mt-6 w-full" size="lg" asChild>
                  <Link href="/contact">Enroll Now</Link>
                </Button>

                {/* {hasInquiryContact && (
                  <div className="mt-5 space-y-2 border-t border-border pt-5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Questions about fees or dates?
                    </p>
                    {activeWhatsapp && (
                      <a
                        href={`https://wa.me/${waDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-brand-red"
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        Chat on WhatsApp
                      </a>
                    )}
                    {activeEmail && (
                      <a
                        href={`mailto:${activeEmail.value}`}
                        className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-brand-red"
                      >
                        <Mail className="size-4" aria-hidden="true" />
                        {activeEmail.value}
                      </a>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
