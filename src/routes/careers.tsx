import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Briefcase, CheckCircle2, Clock, MapPin, Upload } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactInfo } from "@/data/site";
import heroImage from "@/assets/hero-classroom.jpg";
import teamImage from "@/assets/about-team.jpg";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at Altair Academy — Join Our NDT Training Team" },
      {
        name: "description",
        content:
          "Open roles for NDT Level III instructors, assessors and training coordinators at Altair Academy. Submit your resume and join our team.",
      },
      { property: "og:title", content: "Careers at Altair Academy" },
      {
        property: "og:description",
        content: "Teach what you practise — instructor, assessor and coordinator openings at Altair Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareersPage,
});

const openings = [
  {
    title: "NDT Level III Instructor",
    type: "Full Time",
    location: "Masai, Johor",
    scope: "UT / PAUT / TOFD",
    summary:
      "Deliver classroom and practical sessions across advanced ultrasonic methods, prepare candidates for ASNT and PCN examinations and maintain course material.",
  },
  {
    title: "Radiography Instructor (RT)",
    type: "Full Time",
    location: "Masai, Johor",
    scope: "RT / RT-FI",
    summary:
      "Run radiographic testing and film interpretation modules, supervise exposure practicals and uphold radiation safety procedures on site.",
  },
  {
    title: "Certification Assessor",
    type: "Contract",
    location: "Hybrid",
    scope: "Examination body",
    summary:
      "Invigilate and grade practical and theory examinations, verify candidate eligibility and keep certification records audit-ready.",
  },
  {
    title: "Welding Inspection Trainer",
    type: "Full Time",
    location: "Masai, Johor",
    scope: "CSWIP / AWS",
    summary:
      "Coach inspectors through welding technology, codes and visual inspection workshops with hands-on weld sample assessment.",
  },
  {
    title: "Training Coordinator",
    type: "Full Time",
    location: "Masai, Johor",
    scope: "Operations",
    summary:
      "Own the training calendar end to end — intake scheduling, candidate onboarding, venue logistics and client communication.",
  },
  {
    title: "Business Development Executive",
    type: "Full Time",
    location: "Singapore / Johor",
    scope: "Corporate training",
    summary:
      "Grow in-house and corporate training accounts across oil & gas, marine and manufacturing clients in the region.",
  },
];

const perks = [
  "Sponsored certification renewals and method upgrades",
  "Teach on live industrial projects, not just slide decks",
  "Regional exposure across Malaysia, Singapore and the Middle East",
  "Structured mentoring from Level III practitioners",
];

function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page banner */}
        <section className="relative isolate overflow-hidden">
          <img
            src={heroImage}
            alt="Altair Academy training centre"
            width={1600}
            height={600}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-navy/85" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
            <span className="eyebrow text-brand-red-foreground/80">Careers</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              BUILD YOUR CAREER WITH US
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              Join a team of practising inspectors and engineers who train the people keeping critical assets
              safe across the region.
            </p>
          </div>
        </section>

        {/* Intro + image */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Meet the team behind
              <span className="block text-brand-red">every certified inspector</span>
            </h2>
            <p className="text-base text-muted-foreground">
              Come, be part of our team at Altair Academy. Bring your innovative ideas, ingenuity and
              determination to make a difference. Across industries and around the globe, we work with
              exceptional people and leading companies — and we help our students become the next and best
              versions of themselves.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-lg border border-border shadow-sm">
            <img
              src={teamImage}
              alt="Altair Academy team collaborating in the training centre"
              loading="lazy"
              width={1600}
              height={800}
              className="h-[280px] w-full object-cover sm:h-[420px]"
            />
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex gap-3 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        </section>

        {/* Open positions */}
        <section className="bg-secondary/40 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="eyebrow text-brand-red">Open roles</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Currently Open Positions
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {openings.map((role) => (
                <a
                  key={role.title}
                  href="#submit-resume"
                  className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-red/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary">{role.title}</h3>
                      <p className="mt-1 text-sm font-medium text-brand-red">{role.type}</p>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-primary-foreground transition-colors group-hover:bg-brand-red">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                      <span className="sr-only">Apply for {role.title}</span>
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{role.summary}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-brand-red" aria-hidden="true" />
                      {role.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-4 text-brand-red" aria-hidden="true" />
                      {role.scope}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-brand-red" aria-hidden="true" />
                      {role.type}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Submit resume */}
        <section id="submit-resume" className="scroll-mt-24 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            <div>
              <span className="eyebrow text-brand-red">Join us</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Submit Your Resume
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Don't see a role that matches? Send us your details anyway — we review every application and
                get in touch when a matching intake or project opens.
              </p>
              <div className="mt-8 rounded-lg border border-border bg-secondary/50 p-6">
                <p className="text-sm text-muted-foreground">Prefer email? Send your CV directly to</p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="mt-1 block font-display text-lg font-bold text-primary hover:text-brand-red"
                >
                  {contactInfo.email}
                </a>
                <p className="mt-4 text-sm text-muted-foreground">{contactInfo.address}</p>
              </div>
            </div>

            <form
              className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="career-name">Name</Label>
                  <Input id="career-name" name="name" required placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career-email">Email</Label>
                  <Input id="career-email" name="email" type="email" required placeholder="you@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career-phone">Contact number</Label>
                  <Input id="career-phone" name="phone" required placeholder="+60 12 345 6789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career-specialisation">Specialisation</Label>
                  <Input id="career-specialisation" name="specialisation" placeholder="e.g. UT Level III" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="career-message">Message</Label>
                <Textarea
                  id="career-message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your experience and certifications"
                />
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="career-resume">Upload your resume</Label>
                <label
                  htmlFor="career-resume"
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-brand-red/60 hover:text-primary"
                >
                  <Upload className="size-5 text-brand-red" aria-hidden="true" />
                  {fileName ?? "Choose a PDF or Word document"}
                </label>
                <input
                  id="career-resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
              </div>

              <Button type="submit" variant="cta" size="lg" className="mt-6 w-full text-base">
                Submit Application
              </Button>

              {submitted ? (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-red"
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Thanks — your application has been noted. Our team will be in touch shortly.
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
