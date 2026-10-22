import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Compass, Target, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeader } from "@/components/site/SectionHeader";
import { TeamCard } from "@/components/site/TeamCard";
import { team } from "@/data/site";
import heroImage from "@/assets/hero-classroom.jpg";
import aboutLab from "@/assets/about-lab.jpg";
import aboutTeam from "@/assets/about-team.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Altair Academy — Global Leaders of Tomorrow" },
      {
        name: "description",
        content:
          "Altair Academy is a BINDT-approved training organisation delivering NDT, API-ICP, BIM, corrosion and management system courses led by practising specialists.",
      },
      { property: "og:title", content: "About Altair Academy" },
      {
        property: "og:description",
        content:
          "Who we are, our mission, vision, core values and the management team behind Altair Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const highlights = [
  {
    icon: Award,
    title: "Approved Training Organisation",
    body: "BINDT-approved ATO and qualifying body with recognitions from clients, authorities and regulators.",
  },
  {
    icon: Users,
    title: "Professional Instructors",
    body: "Carefully selected practitioners who still work in the disciplines they teach every day.",
  },
  {
    icon: Sparkles,
    title: "Unique Teaching Approach",
    body: "Practical, code-current delivery built around the assessments and assets you work with.",
  },
];

const coreValues = ["Integrity", "Responsibility", "Versatility", "Professional", "Trust", "Quality"];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page banner */}
        <section className="relative isolate overflow-hidden">
          <img
            src={heroImage}
            alt="Altair Academy training auditorium"
            width={1600}
            height={600}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-navy/85" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
            <span className="eyebrow text-brand-red-foreground/80">About us</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              ALTAIR ACADEMY
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              An associate company of Altair Engineering Inspections, founded by people passionate about
              changing how NDT technical professionals learn.
            </p>
          </div>
        </section>

        {/* Who we are */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="relative">
              <img
                src={aboutLab}
                alt="Trainees inspecting pipe samples in the Altair Academy lab"
                loading="lazy"
                width={1200}
                height={900}
                className="w-full rounded-lg border border-border object-cover shadow-sm"
              />
              <div className="absolute -bottom-6 -right-4 hidden w-48 rounded-lg bg-brand-red p-5 text-brand-red-foreground shadow-lg sm:block">
                <p className="font-display text-3xl font-bold">2008</p>
                <p className="mt-1 text-sm opacity-90">Training provision since</p>
              </div>
            </div>
            <div>
              <SectionHeader
                label="Who we are"
                title="Global leaders of tomorrow"
                variant="plain"
              />
              <div className="mt-5 space-y-4 text-base text-muted-foreground">
                <p>
                  Altair Academy began its foray into training provision in 2008 as a BINDT-approved
                  training organisation (ATO) and qualifying body (AQB), and has since won appreciation
                  and approvals from students, clients, authorities and regulators alike.
                </p>
                <p>
                  Fuelled by our founders' passion for teaching, Altair Academy was established to offer a
                  diverse array of professional courses including Non-Destructive Testing (NDT), API-ICP
                  Exam Preparatory, Information Technology, Building Information Modelling (BIM), Food &amp;
                  Beverage (F&amp;B), Corrosion and many others.
                </p>
                <p>
                  Equipped with over a decade of experience, carefully selected instructors and a unique
                  approach to teaching, Altair has become the top choice training provider against our
                  competitors.
                </p>
              </div>
            </div>
          </div>

          {/* Highlight cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="card-lift rounded-lg border border-border bg-card p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-red text-brand-red-foreground">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission / Vision / Values */}
        <section className="bg-secondary py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="What drives us"
              title="Mission, vision and core values"
              align="center"
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <img
                  src={aboutTeam}
                  alt="Altair Academy team collaborating"
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="h-64 w-full object-cover"
                />
                <div className="p-7">
                  <div className="flex items-center gap-2">
                    <Target className="size-5 text-brand-red" aria-hidden="true" />
                    <h3 className="font-display text-lg font-bold text-primary">Mission</h3>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
                      Empowering people through an extensive range of courses delivered by the best and
                      most versatile instructors.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
                      Tailoring offered courses according to the latest technological developments and
                      industrial needs.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-lg border border-border bg-card p-7">
                  <div className="flex items-center gap-2">
                    <Compass className="size-5 text-brand-red" aria-hidden="true" />
                    <h3 className="font-display text-lg font-bold text-primary">Vision</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    To become the best training provider around the globe — recognised for competence,
                    integrity and the career outcomes of our graduates.
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-navy p-7 text-primary-foreground">
                  <h3 className="font-display text-lg font-bold">Our core values</h3>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {coreValues.map((value) => (
                      <span
                        key={value}
                        className="rounded-md border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-3 text-center text-sm font-semibold"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sharpening skills + stats */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                label="What we offer"
                title="Sharpening skills for the future"
                description="Our extensive list of courses is tailored to meet your personal and professional development needs, delivered by dedicated instructors who are passionate about teaching."
              />
              <div className="mt-8 flex gap-12">
                <div>
                  <p className="font-display text-4xl font-bold text-brand-red">15+</p>
                  <p className="mt-1 text-sm text-muted-foreground">Years of experience</p>
                </div>
                <div>
                  <p className="font-display text-4xl font-bold text-brand-red">100+</p>
                  <p className="mt-1 text-sm text-muted-foreground">Organisations trained</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={aboutLab}
                alt="Practical inspection session"
                loading="lazy"
                width={1200}
                height={900}
                className="col-span-2 h-56 w-full rounded-lg border border-border object-cover"
              />
              <img
                src={aboutTeam}
                alt="Classroom discussion"
                loading="lazy"
                width={1200}
                height={900}
                className="h-40 w-full rounded-lg border border-border object-cover"
              />
              <img
                src={heroImage}
                alt="Altair Academy seminar"
                loading="lazy"
                width={1200}
                height={900}
                className="h-40 w-full rounded-lg border border-border object-cover"
              />
            </div>
          </div>
        </section>

        {/* Management team */}
        <section className="bg-secondary py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label="Our team" title="Management team" align="center" variant="plain" />
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {team.map((member) => (
                <div key={member.slug} className="w-full sm:w-80">
                  <TeamCard member={member} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy py-14">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
                Ready to build your certification pathway?
              </h2>
              <p className="mt-2 text-primary-foreground/75">
                Talk to a course manager and we will map the right level to your experience.
              </p>
            </div>
            <div className="flex justify-center">
              <Button variant="cta" size="lg" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
