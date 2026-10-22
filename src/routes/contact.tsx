import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { contactInfo } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Altair Academy — Enrol or Ask a Question" },
      {
        name: "description",
        content:
          "Reach the Altair Academy training team by phone, WhatsApp or email to choose a course or arrange in-house training.",
      },
      { property: "og:title", content: "Contact Altair Academy" },
      { property: "og:description", content: "Phone, WhatsApp, email and office hours for our training team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to our training team"
      intro="Tell us your certification goal and we'll recommend the right course and schedule."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <ul className="space-y-4 text-base text-muted-foreground">
          <li className="flex gap-3">
            <MapPin className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
            {contactInfo.address}
          </li>
          <li className="flex gap-3">
            <Phone className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
            <a href={`tel:${contactInfo.phoneHref}`} className="hover:text-primary">
              {contactInfo.phoneDisplay}
            </a>
          </li>
          <li className="flex gap-3">
            <Mail className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
            <a href={`mailto:${contactInfo.email}`} className="hover:text-primary">
              {contactInfo.email}
            </a>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
            {contactInfo.hours}
          </li>
        </ul>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary">Fastest response</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Message us on WhatsApp during office hours and a course manager will reply directly.
          </p>
          <Button variant="cta" className="mt-5 w-full" asChild>
            <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle />
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
