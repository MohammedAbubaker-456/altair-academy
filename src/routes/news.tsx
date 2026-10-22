import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import heroClassroom from "@/assets/hero-classroom.jpg";
import courseNdt from "@/assets/course-ndt.jpg";
import courseCorrosion from "@/assets/course-corrosion.jpg";
import courseEnergy from "@/assets/course-energy.jpg";
import courseBim from "@/assets/course-bim.jpg";
import aboutLab from "@/assets/about-lab.jpg";
import aboutTeam from "@/assets/about-team.jpg";
import approachClassroom from "@/assets/approach-classroom.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Training Updates — Altair Academy" },
      {
        name: "description",
        content:
          "Course schedule announcements, accreditation news, industry notes and centre updates from Altair Academy's NDT and inspection training team.",
      },
      { property: "og:title", content: "News & Training Updates — Altair Academy" },
      {
        property: "og:description",
        content: "Intake announcements, accreditation updates and inspection industry notes from Altair Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

const featured = {
  date: "18 August 2026",
  category: "Accreditation",
  title: "Altair Academy renews its BINDT-approved training organisation status",
  excerpt:
    "Our Masai centre completed its scheduled surveillance audit this month, confirming continued approval for PCN examination preparation across ultrasonic, radiographic and surface methods.",
  image: heroClassroom,
};

const stories = [
  {
    date: "11 August 2026",
    tags: ["NDT", "Schedule"],
    title: "New PAUT Level 2 intake opens for the October cohort",
    excerpt:
      "Twelve seats only, with practical assessment on live weld samples and scanner setups drawn from current client projects.",
    image: courseNdt,
  },
  {
    date: "2 August 2026",
    tags: ["API-ICP"],
    title: "API 510 preparatory course adds a second mock exam day",
    excerpt:
      "Candidate feedback drove an extra full-length timed paper with code navigation drills before the certification sitting.",
    image: courseCorrosion,
  },
  {
    date: "24 July 2026",
    tags: ["Management Systems"],
    title: "ISO 50001 awareness now available as a live online classroom",
    excerpt:
      "Remote teams can join the two-day awareness programme with the same template pack and auditor Q&A as the on-site run.",
    image: courseEnergy,
  },
  {
    date: "9 July 2026",
    tags: ["BIM", "Infrastructure"],
    title: "Asset assessment with BIM workshop moves to real project datasets",
    excerpt:
      "Participants now work through coordination and clash review using anonymised infrastructure models from regional projects.",
    image: courseBim,
  },
  {
    date: "27 June 2026",
    tags: ["Centre"],
    title: "Practical laboratory expanded with new specimen library",
    excerpt:
      "Additional welded, cast and corroded specimens give candidates more variety before their practical examination.",
    image: aboutLab,
  },
  {
    date: "14 June 2026",
    tags: ["Team"],
    title: "Two new practical instructors join the inspection faculty",
    excerpt:
      "Both bring offshore inspection experience and will support surface method labs and candidate coaching sessions.",
    image: aboutTeam,
  },
];

const picks = [
  {
    date: "30 May 2026",
    title: "How to build a competency matrix your auditors will accept",
    excerpt:
      "A practical walkthrough of mapping methods, levels and renewal dates so inspection teams stay audit-ready all year.",
    image: approachClassroom,
  },
  {
    date: "16 May 2026",
    title: "Choosing between PCN and ASNT for your inspection career",
    excerpt: "What each scheme expects, how employers read them and which route fits the assets you work on.",
  },
  {
    date: "3 May 2026",
    title: "Corrosion under insulation: what field inspectors keep missing",
    excerpt: "Case notes from refinery walkdowns and the screening techniques that catch it early.",
  },
  {
    date: "21 April 2026",
    title: "Preparing for your practical NDT assessment in five steps",
    excerpt: "Specimen handling, reporting discipline and time management advice from our assessors.",
  },
];

const [leadPick, ...otherPicks] = picks as [typeof picks[number], ...typeof picks];

function NewsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page banner */}
        <section className="relative isolate overflow-hidden">
          <img
            src={heroClassroom}
            alt="Altair Academy training centre"
            width={1600}
            height={600}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-navy/85" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
            <span className="eyebrow text-brand-red-foreground/80">Newsroom</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              NEWS &amp; UPDATES
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              Intake announcements, accreditation news and inspection notes from the Altair Academy team.
            </p>
          </div>
        </section>

        {/* Featured story */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-navy">
            <img
              src={featured.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-y-0 right-0 h-full w-full object-cover md:w-2/3"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/20" aria-hidden="true" />
            <div className="relative grid gap-8 p-6 sm:p-10 lg:p-14">
              <div className="max-w-xl bg-background p-6 shadow-xl sm:p-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <span>{featured.date}</span>
                  <span className="text-brand-red">•</span>
                  <span className="text-brand-red">{featured.category}</span>
                </div>
                <span className="mt-4 block h-px w-12 bg-brand-red" aria-hidden="true" />
                <h2 className="mt-5 font-display text-2xl leading-tight font-bold text-primary sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-base text-muted-foreground">{featured.excerpt}</p>
                <Button variant="cta" size="lg" className="mt-6 text-base">
                  Read Full Story
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Latest stories */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeader
            label="Browse the latest updates"
            title="Latest Stories"
            description="Course intakes, accreditation milestones and notes from the training floor."
          />

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <article key={story.title} className="group">
                <div className="relative pr-6 pb-6">
                  <img
                    src={story.image}
                    alt={story.title}
                    loading="lazy"
                    width={640}
                    height={420}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <span
                    className="absolute right-0 bottom-0 h-14 w-20 bg-background"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-xl leading-snug font-bold text-primary transition-colors group-hover:text-brand-red">
                  {story.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <span>{story.date}</span>
                  <span className="text-brand-red">•</span>
                  <span>{story.tags.join(", ")}</span>
                </div>
                <span className="mt-3 block h-px w-10 bg-brand-red/60" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">{story.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-brand-red uppercase">
                  Read more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="ctaOutline" size="lg" className="text-base">
              More Posts
            </Button>
          </div>
        </section>

        {/* Staff picks */}
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
                <img
                  src={leadPick.image}
                  alt={leadPick.title}
                  loading="lazy"
                  width={900}
                  height={600}
                  className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/70 to-navy/10" aria-hidden="true" />
                <div className="p-8">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary-foreground/70 uppercase">
                    <CalendarDays className="size-3.5" />
                    {leadPick.date}
                  </div>
                  <h3 className="mt-3 font-display text-2xl leading-snug font-bold text-primary-foreground">
                    {leadPick.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm text-primary-foreground/75">{leadPick.excerpt}</p>
                </div>
              </article>

              <div className="divide-y divide-primary-foreground/15">
                {otherPicks.map((pick) => (
                  <article key={pick.title} className="group flex gap-5 py-6 first:pt-0 last:pb-0">
                    <span className="mt-1 h-12 w-1 shrink-0 bg-brand-red" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-primary-foreground/60 uppercase">
                        {pick.date}
                      </div>
                      <h3 className="mt-2 font-display text-lg leading-snug font-bold text-primary-foreground transition-colors group-hover:text-brand-red-foreground">
                        {pick.title}
                      </h3>
                      <p className="mt-2 text-sm text-primary-foreground/70">{pick.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                <a href="/contact">Talk to an Advisor</a>
              </Button>
              <Button variant="ctaOutline" size="lg" className="text-base" asChild>
                <a href="/courses">Explore Courses</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
