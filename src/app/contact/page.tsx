/**
 * Public Contact Enquiry Page
 *
 * Server Component displaying database-backed contact information, office hours,
 * and direct WhatsApp messaging channel.
 *
 * Location: src/app/contact/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ContactForm } from "@/components/site/ContactForm";
import { getContactDetails } from "@/server/queries/contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Altair Academy — Enrol or Ask a Question",
  description:
    "Reach the Altair Academy training team by phone, WhatsApp or email to choose a course or arrange in-house training.",
  openGraph: {
    title: "Contact Altair Academy",
    description: "Phone, WhatsApp, email and office hours for our training team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function ContactPage() {
  const contactDetails = await getContactDetails();
  const whatsapp = contactDetails.WHATSAPP[0];

  const hasAnyContact =
    contactDetails.ADDRESS.length > 0 ||
    contactDetails.PHONE.length > 0 ||
    contactDetails.EMAIL.length > 0 ||
    contactDetails.HOURS.length > 0;

  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to our training team"
      intro="Tell us your certification goal and we'll recommend the right course and schedule."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {hasAnyContact ? (
            <ul className="space-y-4 text-base text-muted-foreground">
              {contactDetails.ADDRESS.map((addr) => (
                <li key={addr.id} className="flex gap-3">
                  <MapPin className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <span>{addr.value}</span>
                </li>
              ))}
              {contactDetails.PHONE.map((phone) => (
                <li key={phone.id} className="flex gap-3">
                  <Phone className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <a
                    href={`tel:${phone.link || phone.value}`}
                    className="hover:text-primary transition-colors"
                  >
                    {phone.value}
                  </a>
                </li>
              ))}
              {contactDetails.EMAIL.map((email) => (
                <li key={email.id} className="flex gap-3">
                  <Mail className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <a href={`mailto:${email.value}`} className="hover:text-primary transition-colors">
                    {email.value}
                  </a>
                </li>
              ))}
              {contactDetails.HOURS.map((hours) => (
                <li key={hours.id} className="flex gap-3">
                  <Clock className="mt-1 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <span>{hours.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-muted-foreground italic">
              Contact information is temporarily unavailable.
            </p>
          )}
        </div>

        <div>
          <ContactForm
            hasWhatsapp={Boolean(whatsapp)}
            whatsappDigits={
              whatsapp ? (whatsapp.link || whatsapp.value).replace(/\D/g, "") : undefined
            }
          />
        </div>
      </div>
    </PageShell>
  );
}
