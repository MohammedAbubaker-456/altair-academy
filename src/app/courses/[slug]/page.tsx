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
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Clock,
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
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { PageShell } from "@/components/site/PageShell";
import { CourseCard } from "@/components/site/CourseCard";
import { Button } from "@/components/ui/button";
import { getActiveCourseBySlug, getAllActiveCourses } from "@/server/queries/courses";
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

type DetailSectionData = {
  id: string;
  title: string;
  navLabel: string;
  icon: LucideIcon;
  body: ReactNode;
};

/** Section block used for the long-form content in the details card. */
function DetailSection({ id, title, icon: Icon, body }: DetailSectionData) {
  return (
    <section id={id} className="scroll-mt-36 py-7 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
      </div>
      <div className="mt-4 sm:pl-12">{body}</div>
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

  // Other courses from the same category (max 3)
  const related = course.categorySlug
    ? (await getAllActiveCourses(course.categorySlug))
      .filter((c) => c.slug !== course.slug)
      .slice(0, 3)
    : [];

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

  const feeBody = hasFeeDetails ? (
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
  );

  // One list drives both the jump-nav and the sections, so they can never drift apart.
  const sections: (DetailSectionData | null)[] = [
    has(course.objective)
      ? {
        id: "objective",
        title: "Course objective",
        navLabel: "Objective",
        icon: Target,
        body: <MarkdownContent content={course.objective!} />,
      }
      : null,
    has(course.content)
      ? {
        id: "content",
        title: "Course content",
        navLabel: "Content",
        icon: ListChecks,
        body: <MarkdownContent content={course.content!} />,
      }
      : null,
    has(course.whoShouldAttend)
      ? {
        id: "audience",
        title: "Who should attend",
        navLabel: "Who should attend",
        icon: UserCheck,
        body: <MarkdownContent content={course.whoShouldAttend!} />,
      }
      : null,
    has(course.prerequisites)
      ? {
        id: "prerequisites",
        title: "Pre-requirements",
        navLabel: "Pre-requirements",
        icon: ClipboardCheck,
        body: <MarkdownContent content={course.prerequisites!} />,
      }
      : null,
    has(course.notesAndEquipment)
      ? {
        id: "notes",
        title: "Course notes and equipment",
        navLabel: "Notes & equipment",
        icon: Package,
        body: (
          <p className="whitespace-pre-line text-base text-muted-foreground">
            {course.notesAndEquipment}
          </p>
        ),
      }
      : null,
    showFeeSection
      ? { id: "fee", title: "Course fee", navLabel: "Fee", icon: Wallet, body: feeBody }
      : null,
    has(course.courseSupport)
      ? {
        id: "support",
        title: "Course support",
        navLabel: "Support",
        icon: LifeBuoy,
        body: <MarkdownContent content={course.courseSupport!} />,
      }
      : null,
    has(course.courseNote)
      ? {
        id: "note",
        title: "Note",
        navLabel: "Note",
        icon: Info,
        body: <MarkdownContent content={course.courseNote!} />,
      }
      : null,
  ];
  const visibleSections = sections.filter((s): s is DetailSectionData => s !== null);

  return (
    <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ───────────── Main column ───────────── */}
        <div className="min-w-0 space-y-8 lg:col-span-8">
          {/* Hero image */}
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
            ) : (
              <div className="flex aspect-[16/8] w-full items-center justify-center bg-secondary/50 text-muted-foreground sm:aspect-[16/7]">
                <BookOpen className="size-16 opacity-30" aria-hidden="true" />
              </div>
            )}
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

          {/* Jump-to navigation: sticks under the site header while scrolling the details */}
          {visibleSections.length > 2 && (
            <nav
              aria-label="Course sections"
              className="sticky top-16 z-20 -mx-1 overflow-x-auto rounded-xl border border-border bg-background/90 px-2 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75 "
            >
              <ul className="flex gap-1.5">
                {visibleSections.map((s) => (
                  <li key={s.id} className="shrink-0">
                    <a
                      href={`#${s.id}`}
                      className="block rounded-full px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-brand-red/10 hover:text-brand-red"
                    >
                      {s.navLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Course details */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="pb-6 font-display text-2xl font-bold tracking-tight text-primary">
              Course details
            </h2>
            <div className="divide-y divide-border border-t border-border pt-7">
              {visibleSections.map((s) => (
                <DetailSection key={s.id} {...s} />
              ))}
            </div>
          </div>
        </div>

        {/* ───────────── Sticky enrolment sidebar ───────────── */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="h-1.5 bg-brand-red" />
              <div className="p-6">
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
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ───────────── Related courses ───────────── */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-12" aria-labelledby="related-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-red">
                Keep exploring
              </p>
              <h2
                id="related-heading"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-primary"
              >
                More {category?.short ?? "related"} courses
              </h2>
            </div>
            <Link
              href={`/courses?category=${encodeURIComponent(course.categorySlug)}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-red"
            >
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* ───────────── Mobile enroll bar (the sidebar sits far down on phones) ───────────── */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-background/95 px-4 pt-3 pr-24 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden print:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {showPrice ? course.price : course.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{course.duration}</p>
        </div>
        <Button variant="cta" size="sm" asChild>
          <Link href="/contact">Enroll Now</Link>
        </Button>
      </div>
    </PageShell>
  );
}

// changes 3

// import type { Metadata } from "next";
// import Link from "next/link";
// import Image from "next/image";
// import { notFound } from "next/navigation";
// import {
//   Award,
//   BookOpen,
//   Clock,
//   ClipboardCheck,
//   Info,
//   LifeBuoy,
//   ListChecks,
//   Mail,
//   MessageCircle,
//   Package,
//   Target,
//   UserCheck,
//   Users,
//   Wallet,
//   BarChart3,
// } from "lucide-react";
// import type { ReactNode } from "react";
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

// /** Editorial section used to present course information in a clear reading flow. */
// function DetailSection({
//   icon,
//   title,
//   index,
//   children,
// }: {
//   icon: ReactNode;
//   title: string;
//   index: string;
//   children: ReactNode;
// }) {
//   return (
//     <section className="relative grid gap-4 py-8 first:pt-0 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6">
//       <div className="flex items-start gap-3 sm:block">
//         <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red ring-1 ring-brand-red/15">
//           {icon}
//         </span>
//         <span className="pt-1 text-xs font-bold tracking-[0.18em] text-muted-foreground sm:mt-3 sm:block">
//           {index}
//         </span>
//       </div>
//       <div className="min-w-0">
//         <h3 className="font-display text-xl font-bold tracking-tight text-primary sm:text-2xl">
//           {title}
//         </h3>
//         <div className="mt-4 text-base leading-7 text-muted-foreground [&_a]:font-semibold [&_a]:text-brand-red [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:my-1.5 [&_strong]:font-semibold [&_strong]:text-primary">
//           {children}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** Compact course fact used in the overview strip. */
// function Fact({
//   icon,
//   label,
//   value,
// }: {
//   icon: ReactNode;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex min-w-0 items-center gap-3 border-b border-border/70 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:py-2 sm:last:border-r-0">
//       <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
//         {icon}
//       </span>
//       <div className="min-w-0">
//         <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
//           {label}
//         </p>
//         <p className="mt-1 break-words text-sm font-bold leading-snug text-primary">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
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

//   const has = (v?: string | null) => Boolean(v && v.trim());

//   // `price` sometimes holds a long "send your inquiries" sentence — only show real prices.
//   const showPrice = has(course.price) && course.price.trim().length <= 40;

//   return (
//     <PageShell eyebrow={category?.name ?? "Course"} title={course.title}>
//       <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
//         {/* Main course story */}
//         <main className="min-w-0 space-y-10 lg:col-span-8">
//           {/* Asymmetric editorial hero */}
//           <section className="grid overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground shadow-xl shadow-primary/10 md:grid-cols-[1.15fr_0.85fr]">
//             <div className="relative min-h-[250px] overflow-hidden bg-secondary md:min-h-[390px]">
//               {course.image ? (
//                 <Image
//                   src={course.image}
//                   alt={course.title}
//                   width={1200}
//                   height={900}
//                   priority
//                   sizes="(min-width: 1024px) 45vw, 100vw"
//                   className="absolute inset-0 size-full object-cover"
//                 />
//               ) : (
//                 <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground">
//                   <BookOpen className="size-20 opacity-40" aria-hidden="true" />
//                 </div>
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
//               <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 pr-5">
//                 {category ? (
//                   <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
//                     {category.short}
//                   </span>
//                 ) : null}
//                 {course.subcategory ? (
//                   <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
//                     {course.subcategory.name}
//                   </span>
//                 ) : null}
//               </div>
//             </div>

//             <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
//               <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
//                 <span className="h-px w-7 bg-brand-red" />
//                 Course overview
//               </div>
//               {course.level ? (
//                 <span className="mb-4 w-fit rounded-full bg-brand-red px-3 py-1.5 text-xs font-bold text-white">
//                   {course.level}
//                 </span>
//               ) : null}
//               <p className="text-lg font-semibold leading-relaxed text-white sm:text-xl">
//                 {course.summary}
//               </p>
//               <div className="mt-7 flex items-center gap-3 text-sm text-white/65">
//                 <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
//                   <Clock className="size-4" aria-hidden="true" />
//                 </span>
//                 <span>
//                   <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
//                     Duration
//                   </span>
//                   <span className="mt-0.5 block font-semibold text-white">
//                     {course.duration}
//                   </span>
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Quick facts */}
//           <section aria-label="Course highlights">
//             <div className="mb-3 flex items-center gap-3">
//               <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
//                 At a glance
//               </span>
//               <span className="h-px flex-1 bg-border" />
//             </div>
//             <div className="grid gap-x-3 sm:grid-cols-2 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-4 lg:grid-cols-2 xl:grid-cols-4">
//               <Fact
//                 icon={<Clock className="size-5" aria-hidden="true" />}
//                 label="Duration"
//                 value={course.duration}
//               />
//               {has(course.classCapacity) && (
//                 <Fact
//                   icon={<Users className="size-5" aria-hidden="true" />}
//                   label="Class size"
//                   value={course.classCapacity!}
//                 />
//               )}
//               {has(course.certification) && (
//                 <Fact
//                   icon={<Award className="size-5" aria-hidden="true" />}
//                   label="Certification"
//                   value={course.certification!}
//                 />
//               )}
//               {course.level ? (
//                 <Fact
//                   icon={<BarChart3 className="size-5" aria-hidden="true" />}
//                   label="Level"
//                   value={course.level}
//                 />
//               ) : null}
//             </div>
//           </section>

//           {/* Long-form course information */}
//           <section>
//             <div className="mb-7 flex items-end justify-between gap-4 border-b border-border pb-5">
//               <div>
//                 <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
//                   Explore the programme
//                 </p>
//                 <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
//                   What you need to know
//                 </h2>
//               </div>
//               <BookOpen className="mb-1 size-7 shrink-0 text-brand-red/70" aria-hidden="true" />
//             </div>

//             <div className="relative">
//               <div className="absolute bottom-4 left-[1.35rem] top-4 hidden w-px bg-border sm:block" />
//               {has(course.objective) && (
//                 <DetailSection
//                   index="01"
//                   icon={<Target className="size-5" aria-hidden="true" />}
//                   title="Course objective"
//                 >
//                   <MarkdownContent content={course.objective!} />
//                 </DetailSection>
//               )}

//               {has(course.content) && (
//                 <DetailSection
//                   index="02"
//                   icon={<ListChecks className="size-5" aria-hidden="true" />}
//                   title="Course content"
//                 >
//                   <MarkdownContent content={course.content!} />
//                 </DetailSection>
//               )}

//               {has(course.whoShouldAttend) && (
//                 <DetailSection
//                   index="03"
//                   icon={<UserCheck className="size-5" aria-hidden="true" />}
//                   title="Who should attend"
//                 >
//                   <MarkdownContent content={course.whoShouldAttend!} />
//                 </DetailSection>
//               )}

//               {has(course.prerequisites) && (
//                 <DetailSection
//                   index="04"
//                   icon={<ClipboardCheck className="size-5" aria-hidden="true" />}
//                   title="Pre-requirements"
//                 >
//                   <MarkdownContent content={course.prerequisites!} />
//                 </DetailSection>
//               )}

//               {has(course.notesAndEquipment) && (
//                 <DetailSection
//                   index="05"
//                   icon={<Package className="size-5" aria-hidden="true" />}
//                   title="Course notes and equipment"
//                 >
//                   <p className="whitespace-pre-line text-base leading-7 text-muted-foreground">
//                     {course.notesAndEquipment}
//                   </p>
//                 </DetailSection>
//               )}

//               {showFeeSection && (
//                 <DetailSection
//                   index="06"
//                   icon={<Wallet className="size-5" aria-hidden="true" />}
//                   title="Course fee"
//                 >
//                   {hasFeeDetails ? (
//                     <MarkdownContent content={course.feeDetails!} />
//                   ) : (
//                     <div className="space-y-4">
//                       <p>Send your inquiries to:</p>
//                       <div className="flex flex-wrap gap-3">
//                         {activeEmail && (
//                           <a
//                             href={`mailto:${activeEmail.value}`}
//                             className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-brand-red hover:text-brand-red"
//                           >
//                             <Mail className="size-4" aria-hidden="true" />
//                             {activeEmail.value}
//                           </a>
//                         )}
//                         {activeWhatsapp && (
//                           <a
//                             href={`https://wa.me/${waDigits}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-brand-red hover:text-brand-red"
//                           >
//                             <MessageCircle className="size-4" aria-hidden="true" />
//                             {activeWhatsapp.value}
//                           </a>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </DetailSection>
//               )}

//               {has(course.courseSupport) && (
//                 <DetailSection
//                   index="07"
//                   icon={<LifeBuoy className="size-5" aria-hidden="true" />}
//                   title="Course support"
//                 >
//                   <MarkdownContent content={course.courseSupport!} />
//                 </DetailSection>
//               )}

//               {has(course.courseNote) && (
//                 <DetailSection
//                   index="08"
//                   icon={<Info className="size-5" aria-hidden="true" />}
//                   title="Note"
//                 >
//                   <MarkdownContent content={course.courseNote!} />
//                 </DetailSection>
//               )}
//             </div>
//           </section>
//         </main>

//         {/* Sticky enrolment panel — intentionally retained on desktop */}
//         <aside className="min-w-0 lg:col-span-4">
//           <div className="lg:sticky lg:top-24">
//             <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_24px_70px_-35px_rgba(0,0,0,0.35)]">
//               <div className="absolute inset-x-0 top-0 h-2 bg-brand-red" />
//               <div className="relative overflow-hidden bg-primary px-6 pb-7 pt-9 text-primary-foreground sm:px-7">
//                 <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full border-[28px] border-white/[0.06]" />
//                 <div className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-brand-red/20 blur-2xl" />
//                 <div className="relative">
//                   <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
//                     Take the next step
//                   </p>
//                   <h2 className="mt-3 max-w-xs font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
//                     Ready to build your expertise?
//                   </h2>
//                   <p className="mt-3 text-sm leading-6 text-white/65">
//                     Reserve your seat and speak with our team about this course.
//                   </p>
//                   {showPrice && (
//                     <div className="mt-6 border-t border-white/15 pt-5">
//                       <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
//                         Course fee
//                       </p>
//                       <p className="mt-1 break-words text-2xl font-bold text-white">
//                         {course.price}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="p-6 sm:p-7">
//                 <div className="mb-5 flex flex-wrap gap-2">
//                   {category ? (
//                     <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
//                       {category.short}
//                     </span>
//                   ) : null}
//                   {course.subcategory ? (
//                     <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
//                       {course.subcategory.name}
//                     </span>
//                   ) : null}
//                   {course.level ? (
//                     <span className="rounded-full bg-brand-red/10 px-3 py-1.5 text-xs font-bold text-brand-red">
//                       {course.level}
//                     </span>
//                   ) : null}
//                 </div>

//                 <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
//                   Course at a glance
//                 </p>
//                 <ul className="space-y-4">
//                   <li className="flex items-start gap-3">
//                     <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
//                       <Clock className="size-4" aria-hidden="true" />
//                     </span>
//                     <span className="min-w-0 pt-0.5">
//                       <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                         Duration
//                       </span>
//                       <span className="mt-0.5 block text-sm font-semibold text-primary">
//                         {course.duration}
//                       </span>
//                     </span>
//                   </li>
//                   {has(course.classCapacity) && (
//                     <li className="flex items-start gap-3">
//                       <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
//                         <Users className="size-4" aria-hidden="true" />
//                       </span>
//                       <span className="min-w-0 pt-0.5">
//                         <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                           Class size
//                         </span>
//                         <span className="mt-0.5 block text-sm font-semibold text-primary">
//                           {course.classCapacity}
//                         </span>
//                       </span>
//                     </li>
//                   )}
//                   {has(course.certification) && (
//                     <li className="flex items-start gap-3">
//                       <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
//                         <Award className="size-4" aria-hidden="true" />
//                       </span>
//                       <span className="min-w-0 pt-0.5">
//                         <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                           Certification
//                         </span>
//                         <span className="mt-0.5 block text-sm font-semibold text-primary">
//                           {course.certification}
//                         </span>
//                       </span>
//                     </li>
//                   )}
//                 </ul>

//                 <Button
//                   variant="cta"
//                   className="mt-7 h-12 w-full text-sm font-bold shadow-lg shadow-brand-red/15 transition-transform hover:-translate-y-0.5"
//                   size="lg"
//                   asChild
//                 >
//                   <Link href="/contact">Enroll Now</Link>
//                 </Button>

//                 <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
//                   Have questions? Contact our team to discuss your training needs.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </PageShell>
//   );
// }
