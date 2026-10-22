import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { instructors } from "@/data/site";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-classroom.jpg";

export const Route = createFileRoute("/instructors")({
  head: () => ({
    meta: [
      { title: "Instructors — Altair Academy" },
      {
        name: "description",
        content:
          "Meet the practising NDT, corrosion, BIM and management system specialists who lead every Altair Academy training programme.",
      },
      { property: "og:title", content: "Leading Instructors — Altair Academy" },
      {
        property: "og:description",
        content: "Practising specialists in NDT, welding, corrosion, BIM and quality leading every Altair class.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstructorsPage,
});

function initials(name: string) {
  return name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function InstructorsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Page banner */}
        <section className="relative isolate overflow-hidden">
          <img
            src={heroImage}
            alt="Altair Academy instructor leading a classroom session"
            width={1600}
            height={600}
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-navy/85" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
            <span className="eyebrow text-brand-red-foreground/80">Instructors</span>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              MEET OUR TEAM
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
              Every Altair programme is taught by a certified practitioner who still works in the discipline
              they teach — not a lecturer reading from a slide deck.
            </p>
          </div>
        </section>

        {/* Alternating instructor rows */}
        <section className="bg-secondary/40">
          {instructors.map((person, index) => {
            const flipped = index % 2 === 1;
            return (
              <article
                key={person.slug}
                className={cn(
                  "border-b border-border/70",
                  index % 2 === 1 ? "bg-background" : "bg-secondary/30",
                )}
              >
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                  {/* Portrait */}
                  <div className={cn("flex justify-center", flipped ? "lg:order-1" : "lg:order-2")}>
                    <div className="relative">
                      <span
                        className="absolute -inset-4 rounded-full bg-brand-red/10"
                        aria-hidden="true"
                      />
                      <div className="relative size-56 overflow-hidden rounded-full border-8 border-navy/90 shadow-[0_24px_48px_-24px_color-mix(in_oklab,var(--navy)_60%,transparent)] sm:size-72">
                        {person.image ? (
                          <img
                            src={person.image}
                            alt={person.name}
                            loading="lazy"
                            width={800}
                            height={800}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-navy">
                            <span className="font-display text-5xl font-bold text-primary-foreground">
                              {initials(person.name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Copy */}
                  <div className={cn(flipped ? "lg:order-2" : "lg:order-1")}>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                      {person.name}
                    </h2>
                    <p className="eyebrow mt-2">{person.role}</p>
                    <span className="mt-4 block h-px w-16 bg-brand-red/60" aria-hidden="true" />
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground">{person.bio}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {person.expertise.map((item) => (
                        <li
                          key={item}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-primary"
                        >
                          <CheckCircle2 className="size-4 text-brand-red" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

      </main>
      <Footer />
    </div>
  );
}
