/**
 * Public Website Footer Component
 *
 * Server Component rendering database-backed contact details, social links,
 * course navigation, and dynamic footer legal pages.
 *
 * Location: src/components/site/Footer.tsx
 * Type: Server Component
 */

import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { courseMenu } from "@/data/menu";
import logo from "@/assets/altair-academy-logo.png";
import { getContactDetails } from "@/server/queries/contact";
import { getFooterLegalLinks } from "@/server/queries/legal";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.051-1.36l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function getSocialIcon(label: string | null) {
  const norm = (label ?? "").toLowerCase();
  if (norm.includes("facebook")) return Facebook;
  if (norm.includes("linkedin")) return Linkedin;
  if (norm.includes("instagram")) return Instagram;
  if (norm.includes("twitter") || norm === "x") return Twitter;
  if (norm.includes("youtube")) return Youtube;
  if (norm.includes("whatsapp")) return WhatsAppIcon;
  return Globe;
}

export async function Footer() {
  const [contactDetails, legalLinks] = await Promise.all([
    getContactDetails(),
    getFooterLegalLinks(),
  ]);

  // Build social icons list: active SOCIAL entries + WHATSAPP entry if available
  const socialItems = contactDetails.SOCIAL.map((s) => ({
    key: s.id,
    label: s.label || s.value,
    href: s.link || s.value,
    Icon: getSocialIcon(s.label || s.value),
  }));

  const hasWhatsAppSocial = socialItems.some((s) => s.label.toLowerCase().includes("whatsapp"));
  const wa = contactDetails.WHATSAPP[0];
  if (!hasWhatsAppSocial && wa) {
    const waDigits = wa.link || wa.value;
    socialItems.push({
      key: wa.id,
      label: wa.label || "WhatsApp",
      href: `https://wa.me/${waDigits}`,
      Icon: WhatsAppIcon,
    });
  }

  const hasContactInfo =
    contactDetails.ADDRESS.length > 0 ||
    contactDetails.PHONE.length > 0 ||
    contactDetails.EMAIL.length > 0 ||
    contactDetails.HOURS.length > 0;

  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-flex rounded-md bg-background px-3 py-2">
              <Image
                src={logo}
                alt="Altair Academy"
                width={190}
                height={60}
                className="h-8 w-auto"
              />
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Accredited technical training in inspection, integrity and management systems —
              delivered by practising industry specialists.
            </p>
            {socialItems.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialItems.map((social) => {
                  const Icon = social.Icon;
                  return (
                    <a
                      key={social.key}
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-brand-red"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-widest uppercase">
              Get in touch
            </h3>
            {hasContactInfo ? (
              <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
                {contactDetails.ADDRESS.map((addr) => (
                  <li key={addr.id} className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                    <span>{addr.value}</span>
                  </li>
                ))}
                {contactDetails.PHONE.map((phone) => (
                  <li key={phone.id} className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                    <a
                      href={`tel:${phone.link || phone.value}`}
                      className="hover:text-primary-foreground"
                    >
                      {phone.value}
                    </a>
                  </li>
                ))}
                {contactDetails.EMAIL.map((email) => (
                  <li key={email.id} className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                    <a href={`mailto:${email.value}`} className="hover:text-primary-foreground">
                      {email.value}
                    </a>
                  </li>
                ))}
                {contactDetails.HOURS.map((hours) => (
                  <li key={hours.id} className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                    <span>{hours.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-primary-foreground/60 italic">
                Contact information unavailable.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-widest uppercase">
              Course areas
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              {courseMenu.slice(0, 6).map((item) => (
                <li key={item.category}>
                  <Link
                    href={`/courses?category=${encodeURIComponent(item.category)}`}
                    className="hover:text-primary-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-widest uppercase">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              <li>
                <Link href="/about" className="hover:text-primary-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary-foreground">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-primary-foreground">
                  Instructors
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary-foreground">
                  News
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Altair Academy
            <br />
            All Rights Reserved
          </p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <Link key={link.id} href={link.href} className="hover:text-primary-foreground">
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <FloatingWhatsApp />
    </footer>
  );
}
