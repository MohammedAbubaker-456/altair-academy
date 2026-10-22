import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  GraduationCap,
  Headphones,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Phone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeader } from "@/components/site/SectionHeader";
import { FeaturedCourseCard } from "@/components/site/FeaturedCourseCard";
import { TeamCard } from "@/components/site/TeamCard";
import { Testimonials } from "@/components/site/Testimonials";
import {
  categories,
  contactInfo,
  courses,
  faqs,
  team,
  trainingFormats,
  upcomingSessions,
} from "@/data/site";
import heroImage from "@/assets/hero-classroom.jpg";
import approachImage from "@/assets/approach-classroom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Altair Academy — Accredited Technical Training in Malaysia" },
      {
        name: "description",
        content:
          "Altair Academy delivers accredited NDT, corrosion, BIM and management system training led by practising industry specialists. Explore courses and enrol today.",
      },
      { property: "og:title", content: "Altair Academy — Accredited Technical Training" },
      {
        property: "og:description",
        content:
          "Hands-on inspection, integrity and management system courses taught by working industry specialists.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: MonitorPlay,
    title: "Professional Courses",
    body: "Customised course paths built around the competencies your team is assessed on.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    body: "Every class is taught by a practitioner still working in the field they teach.",
  },
  {
    icon: GraduationCap,
    title: "Powerful Programs",
    body: "Programmes kept current with prevailing codes, standards and industry practice.",
  },
  {
    icon: Headphones,
    title: "After Class Support",
    body: "Questions after certification? Our support team stays available to you.",
  },
];

const aboutPoints = [
  "Accredited syllabi aligned to ISO 9712, API and ISO management standards",
  "Small cohorts with real equipment and supervised practical hours",
  "Course managers who map the right certification level to your career stage",
];

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-secondary">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,color-mix(in_oklab,var(--navy)_14%,transparent),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-24">
            <div>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-primary sm:text-6xl">
                Upskill Your NDT Certifications with Altair Academy
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground">
                A decade of hands-on inspection, integrity and management system training. Carefully
                selected instructors, practical labs, and certifications employers across the region
                actually recognise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="cta" size="lg" className="text-base" asChild>
                  <Link to="/courses">
                    Explore Courses
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant="ctaOutline" size="lg" className="text-base" asChild>
                  <Link to="/contact">Talk to an Advisor</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <div>
                  <p className="font-display text-2xl font-bold text-primary">2000+</p>
                  <p className="text-sm text-muted-foreground">Certified students</p>
                </div>
                <span className="hidden h-10 w-px bg-border sm:block" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-bold text-primary">40+</p>
                  <p className="text-sm text-muted-foreground">Course titles</p>
                </div>
                <span className="hidden h-10 w-px bg-border sm:block" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-bold text-primary">6+</p>
                  <p className="text-sm text-muted-foreground">Countries served</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="Instructor leading a technical training class at Altair Academy"
                width={1600}
                height={1000}
                className="h-72 w-full rounded-2xl object-cover shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--navy)_60%,transparent)] sm:h-[26rem]"
              />
              <div className="absolute -top-4 right-4 hidden items-center gap-3 rounded-xl bg-navy px-4 py-3 text-primary-foreground shadow-lg sm:flex">
                <BadgeCheck className="size-5 text-brand-red" aria-hidden="true" />
                <span className="text-sm font-semibold">98% First Attempt Pass Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category band */}
        <section className="bg-navy py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-primary-foreground">
                <span className="font-display text-lg font-bold whitespace-nowrap">Our Courses</span>
              </div>
              <p className="text-sm text-primary-foreground/70">
                Choose a category to see the courses we run across NDT, BIM, management systems and more.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to="/courses"
                  search={{ category: category.slug }}
                  className="whitespace-nowrap rounded-full border border-primary-foreground/25 px-4 py-1.5 text-sm text-primary-foreground/85 transition-colors hover:border-brand-red hover:bg-brand-red hover:text-brand-red-foreground active:bg-brand-red-hover"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About split */}
        <section className="py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="relative">
              <img
                src={approachImage}
                alt="Students working through a practical exercise with an instructor"
                loading="lazy"
                width={1400}
                height={1000}
                className="h-80 w-full rounded-2xl object-cover sm:h-[24rem]"
              />
              <div className="absolute right-4 bottom-4 rounded-xl bg-brand-red px-5 py-4 text-brand-red-foreground shadow-lg">
                <p className="font-display text-3xl font-bold">10+ Years</p>
                <p className="text-xs opacity-90">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Training experience</p>
              </div>
            </div>
            <div>
              <SectionHeader
                label="About Altair"
                title="Empowering Engineers, Transforming Worksites"
                description="We built Altair around one idea: technical training should be practical enough to use the week you return to work."
              />
              <ul className="mt-6 space-y-3">
                {aboutPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 border-b border-border pb-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Button variant="cta" className="mt-7 text-base" asChild>
                <Link to="/about">See Our Approach</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured courses */}
        <section className="bg-secondary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                label="Featured class"
                title="Learn From Our Most Requested Courses"
                variant="divider"
              />
              <p className="max-w-md text-sm text-muted-foreground">
                Every programme below runs on a fixed calendar with practical assessment included. Prices
                shown are per seat for public classroom delivery.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {courses.map((course) => (
                <FeaturedCourseCard key={course.slug} course={course} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button variant="cta" size="lg" className="text-base" asChild>
                <Link to="/courses">View More Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Upcoming sessions */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Training calendar"
              title="Join Our Next Scheduled Intake"
              variant="plain"
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingSessions.map((session) => (
                <article
                  key={session.title}
                  className="card-lift flex flex-col rounded-xl border border-border bg-card p-5"
                >
                  <span className="eyebrow">{session.date}</span>
                  <h3 className="mt-2 font-display text-base font-bold text-primary">{session.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-brand-red" aria-hidden="true" />
                    {session.location}
                  </p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {session.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ctaOutline" size="default" className="mt-5 w-full text-base" asChild>
                    <Link to="/courses/$slug" params={{ slug: session.slug }}>
                      Reserve a Seat
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Altair */}
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Why choose us"
              title="Elevate Your Technical Skills With The Best"
              description="Four things every Altair cohort gets, whether you train with us in Singapore, on your own site, or live online."
              onDark
              variant="plain"
            />
            <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-xl border border-primary-foreground/12 bg-primary-foreground/5 p-5 transition-colors hover:border-brand-red/60"
                  >
                    <span className="flex size-11 items-center justify-center rounded-lg bg-brand-red/15 text-brand-red">
                      <pillar.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-primary-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm text-primary-foreground/70">{pillar.body}</p>
                  </div>
                ))}
              </div>
              <img
                src={heroImage}
                alt="Altair instructor presenting to a class"
                loading="lazy"
                width={1400}
                height={1000}
                className="h-full max-h-[26rem] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Training formats */}
        {/* <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              label="How we deliver"
              title="Choose the Training Format That Fits Your Team"
              variant="plain"
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {trainingFormats.map((format) => (
                <div
                  key={format.name}
                  className={
                    format.featured
                      ? "relative rounded-2xl bg-navy p-7 text-primary-foreground shadow-xl"
                      : "relative rounded-2xl border border-border bg-card p-7"
                  }
                >
                  {format.featured ? (
                    <span className="absolute -top-3 left-7 rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-brand-red-foreground">
                      {format.tagline}
                    </span>
                  ) : (
                    <span className="eyebrow">{format.tagline}</span>
                  )}
                  <p
                    className={`mt-4 font-display text-3xl font-bold ${format.featured ? "text-primary-foreground" : "text-brand-red"}`}
                  >
                    {format.price}
                    <span
                      className={`ml-1 text-sm font-medium ${format.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {format.unit}
                    </span>
                  </p>
                  <h3
                    className={`mt-2 font-display text-lg font-bold ${format.featured ? "text-primary-foreground" : "text-primary"}`}
                  >
                    {format.name}
                  </h3>
                  <ul className="mt-5 space-y-2">
                    {format.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className={`flex items-start gap-2 text-sm ${format.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={format.featured ? "ctaOnDark" : "ctaOutline"}
                    className="mt-7 w-full text-base"
                    asChild
                  >
                    <Link to="/contact">Request a Quote</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Advisory */}
        <section className="bg-secondary py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionHeader
                label="Join us now"
                title={"Confused What to Choose? \nWe Got You!"}
                description="Our support centre and course managers will help you pick the right subject and certification level for where you are in your career."
                variant="plain"
              />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="cta" className="text-base" asChild>
                  <Link to="/contact">Get Help Choosing</Link>
                </Button>
                <a
                  href={`tel:${contactInfo.phoneHref}`}
                  className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Phone className="size-4 text-brand-red" aria-hidden="true" />
                  {contactInfo.homepagePhoneDisplay}
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <MessageCircle className="size-4 text-brand-red" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-navy p-6 text-primary-foreground">
                <p className="font-display text-3xl font-bold">40+</p>
                <p className="mt-1 text-sm text-primary-foreground/70">Course titles available</p>
              </div>
              <div className="rounded-xl bg-brand-red p-6 text-brand-red-foreground">
                <p className="font-display text-3xl font-bold">98%</p>
                <p className="mt-1 text-sm opacity-90">First-attempt pass rate</p>
              </div>
              <div className="rounded-xl bg-navy-deep p-6 text-primary-foreground">
                <p className="font-display text-3xl font-bold">2000+</p>
                <p className="mt-1 text-sm text-primary-foreground/70">Satisfied students</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-display text-3xl font-bold text-primary">6+</p>
                <p className="mt-1 text-sm text-muted-foreground">Countries served</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              label="Our team"
              title="Management Team"
              variant="plain"
            />
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {team.map((member) => (
                <div key={member.slug} className="w-full sm:w-80">
                  <TeamCard member={member} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-secondary py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              label="Testimonials"
              title="From Our Students"
              variant="plain"
            />
            <Testimonials />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              align="center"
              label="FAQ"
              title="Frequently asked questions"
              variant="plain"
            />
            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-left font-display text-base font-semibold text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <img
                src={approachImage}
                alt="Course manager advising a prospective student"
                loading="lazy"
                width={1400}
                height={1000}
                className="hidden h-full max-h-[24rem] w-full rounded-2xl object-cover lg:block"
              />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-navy-deep py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span className="eyebrow">Get started</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Certification Is the Next Step{"\u00a0\n"}Take it With Altair
            </h2>
            <p className="mt-4 text-base text-primary-foreground/70">
              Tell us your role and the standard you work to, and we'll map the shortest credible route to
              your certification.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="cta" size="lg" className="text-base" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="ctaOnDark" size="lg" className="text-base" asChild>
                <Link to="/calendar">Browse the Calendar</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
