/**
 * Public News & Updates Page
 *
 * Server Component rendering the latest news feed from MongoDB.
 * Features the primary announcement, latest stories grid, and editor's picks.
 * All news cards link directly to their dynamic detail page at /news/[slug].
 *
 * Location: src/app/news/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeader } from "@/components/site/SectionHeader";
import { NewsStoryCard } from "@/components/site/NewsStoryCard";
import { Button } from "@/components/ui/button";
import { getNewsFeed } from "@/server/queries/news";
import { getPageMetadata } from "@/server/seo";
import { formatNewsDate } from "@/lib/format";
import heroClassroom from "@/assets/hero-classroom.jpg";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("news");
}

export default async function NewsPage() {
  const { featured, stories, picks } = await getNewsFeed();
  const leadPick = picks[0];
  const otherPicks = picks.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page banner */}
        <section className="relative isolate overflow-hidden">
          <Image
            src={heroClassroom}
            alt="Altair Academy training centre"
            width={1600}
            height={600}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-navy/85" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
            <span className="eyebrow text-brand-red-foreground/80">Newsroom</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              NEWS &amp; UPDATES
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              Intake announcements, accreditation news and inspection notes from the Altair Academy
              team.
            </p>
          </div>
        </section>

        {/* Featured story */}
        {featured ? (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-navy">
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt=""
                  aria-hidden="true"
                  width={1600}
                  height={800}
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="absolute inset-y-0 right-0 h-full w-full object-cover md:w-2/3"
                />
              ) : null}
              <div
                className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/20"
                aria-hidden="true"
              />
              <div className="relative grid gap-8 p-6 sm:p-10 lg:p-14">
                <div className="max-w-xl bg-background p-6 shadow-xl sm:p-10">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    <span>{formatNewsDate(featured.publishedAt)}</span>
                    {featured.category ? (
                      <>
                        <span className="text-brand-red">•</span>
                        <span className="text-brand-red">{featured.category}</span>
                      </>
                    ) : null}
                  </div>
                  <span className="mt-4 block h-px w-12 bg-brand-red" aria-hidden="true" />
                  <h2 className="mt-5 font-display text-2xl leading-tight font-bold text-primary sm:text-3xl">
                    <Link
                      href={`/news/${featured.slug}`}
                      className="hover:text-brand-red transition-colors"
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-base text-muted-foreground">{featured.excerpt}</p>
                  <Button variant="cta" size="lg" className="mt-6 text-base" asChild>
                    <Link href={`/news/${featured.slug}`}>
                      Read Full Story
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Latest stories */}
        {stories.length > 0 ? (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <SectionHeader
              label="Browse the latest updates"
              title="Latest Stories"
              description="Course intakes, accreditation milestones and notes from the training floor."
            />

            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <NewsStoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Staff picks */}
        {leadPick ? (
          <section className="bg-navy py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                label="You have to read this"
                title="Editor's Picks"
                description="Longer reads from our instructors on certification routes and field inspection practice."
                onDark
              />

              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <article className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden">
                  <Link href={`/news/${leadPick.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Read {leadPick.title}</span>
                  </Link>
                  {leadPick.image ? (
                    <Image
                      src={leadPick.image}
                      alt={leadPick.title}
                      width={900}
                      height={600}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/70 to-navy/10"
                    aria-hidden="true"
                  />
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary-foreground/70 uppercase">
                      <CalendarDays className="size-3.5" />
                      {formatNewsDate(leadPick.publishedAt)}
                    </div>
                    <h3 className="mt-3 font-display text-2xl leading-snug font-bold text-primary-foreground transition-colors group-hover:text-brand-red-foreground">
                      {leadPick.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-sm text-primary-foreground/75">
                      {leadPick.excerpt}
                    </p>
                  </div>
                </article>

                {otherPicks.length > 0 ? (
                  <div className="divide-y divide-primary-foreground/15">
                    {otherPicks.map((pick) => (
                      <article key={pick.id} className="group flex gap-5 py-6 first:pt-0 last:pb-0">
                        <span className="mt-1 h-12 w-1 shrink-0 bg-brand-red" aria-hidden="true" />
                        <div>
                          <div className="text-xs font-semibold tracking-[0.14em] text-primary-foreground/60 uppercase">
                            {formatNewsDate(pick.publishedAt)}
                          </div>
                          <h3 className="mt-2 font-display text-lg leading-snug font-bold text-primary-foreground transition-colors group-hover:text-brand-red-foreground">
                            <Link href={`/news/${pick.slug}`}>{pick.title}</Link>
                          </h3>
                          <p className="mt-2 text-sm text-primary-foreground/70">{pick.excerpt}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* Newsletter */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 border border-border bg-muted/40 p-10 text-center">
            <SectionHeader
              label="Stay in the loop"
              title="Get Intake Dates Before They Fill"
              description="We publish new course schedules here first. Ask our advisors to add you to the announcement list."
              align="center"
            />
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="cta" size="lg" className="text-base" asChild>
                <Link href="/contact">Talk to an Advisor</Link>
              </Button>
              <Button variant="ctaOutline" size="lg" className="text-base" asChild>
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
