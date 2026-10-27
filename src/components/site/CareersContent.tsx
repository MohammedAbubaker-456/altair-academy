/**
 * Public Careers Page Content Component
 *
 * Server Component rendering career perks, dynamic job openings fetched from MongoDB,
 * database-backed contact information, and the client application form.
 *
 * Location: src/components/site/CareersContent.tsx
 * Type: Server Component
 */

import Image from "next/image";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  MapPin,
  Award,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CareersForm } from "@/components/site/CareersForm";
import { formatEmploymentType } from "@/lib/careers";
import type { JobOpeningDTO } from "@/server/queries/careers";
import type { LegacyContactInfo } from "@/server/queries/contact";
import heroImage from "@/assets/hero-classroom.jpg";
import teamImage from "@/assets/about-team.jpg";

const perks = [
  {
    icon: Award,
    title: "Accredited Training Floor",
    description:
      "Deliver BINDT-approved and scheme-compliant syllabuses with dedicated practical bays for ultrasonic, radiography and surface methods.",
  },
  {
    icon: BookOpen,
    title: "Continuous Professional Growth",
    description:
      "Sponsored Level III method expansion, instructor CPD hours and access to regional inspection standards committees.",
  },
  {
    icon: ShieldCheck,
    title: "Industry-Standard Equipment",
    description:
      "Work with modern phased array units, calibration blocks, radiography enclosures and weld flaw specimens matching real field assets.",
  },
  {
    icon: HeartHandshake,
    title: "Collaborative Practitioner Team",
    description:
      "Teach alongside practising NDT Level IIIs, plant inspectors and welding engineers who value quality tuition over cohort volume.",
  },
];

interface CareersContentProps {
  openings: JobOpeningDTO[];
  contactInfo: LegacyContactInfo;
}

export function CareersContent({ openings, contactInfo }: CareersContentProps) {
  const hasEmailOrAddress = Boolean(contactInfo.email || contactInfo.address);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Banner */}
        <section className="relative isolate overflow-hidden bg-navy py-16 text-primary-foreground sm:py-20">
          <Image
            src={heroImage}
            alt=""
            priority
            fill
            sizes="100vw"
            className="absolute inset-0 -z-10 object-cover opacity-20"
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="eyebrow text-brand-red-foreground/80">Careers at Altair</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              TEACH WHAT YOU PRACTISE
            </h1>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/75 sm:text-lg">
              We are looking for practising NDT Level IIIs, inspection assessors and technical
              trainers who want to build the next generation of asset integrity professionals.
            </p>
          </div>
        </section>

        {/* Why teach with us */}
        {/* <section className="py-16 sm:py-20"> */}
        {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center"> */}
        {/* <div>
                <span className="eyebrow text-brand-red">Why Altair Academy</span>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Built by inspectors, for inspectors
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                  Altair Academy is an approved training organisation delivering certification
                  programmes across advanced ultrasonic, radiographic and surface methods. Our
                  trainers are practising specialists — we value deep field experience, clear
                  instruction and high candidate outcomes.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {perks.map((perk) => (
                    <div key={perk.title} className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand-red">
                        <perk.icon className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-primary">
                          {perk.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">{perk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
        {/* <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src={teamImage}
                  alt="Altair Academy training team"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div> */}
        {/* </div>
          </div> */}
        {/* </section> */}

        {/* Open positions */}
        <section className="bg-secondary/40 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="eyebrow text-brand-red">Open roles</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Currently Open Positions
              </h2>
            </div>

            {openings.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {openings.map((role) => (
                  <a
                    key={role.id}
                    href="#submit-resume"
                    className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-red/50 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-primary">
                          {role.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-brand-red">
                          {formatEmploymentType(role.employmentType)}
                        </p>
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
                        {formatEmploymentType(role.employmentType)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-lg border border-dashed border-border bg-card p-8 text-center">
                <p className="text-base text-muted-foreground">
                  No open positions right now. Send us your details below and we will get in touch
                  when a role opens.
                </p>
                <div className="mt-5">
                  <a
                    href="#submit-resume"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline"
                  >
                    Send us your details below
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
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
                Don't see a role that matches? Send us your details anyway — we review every
                application and get in touch when a matching intake or project opens.
              </p>
              {hasEmailOrAddress && (
                <div className="mt-8 rounded-lg border border-border bg-secondary/50 p-6">
                  {contactInfo.email ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Prefer email? Send your CV directly to
                      </p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="mt-1 block font-display text-lg font-bold text-primary hover:text-brand-red"
                      >
                        {contactInfo.email}
                      </a>
                    </>
                  ) : null}
                  {contactInfo.address ? (
                    <p className="mt-4 text-sm text-muted-foreground">{contactInfo.address}</p>
                  ) : null}
                </div>
              )}
            </div>

            <CareersForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
