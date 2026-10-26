/**
 * Seed Data: Contact Details
 *
 * Initial contact information, office hours, and social media channels.
 *
 * Location: prisma/seed-data/contact.ts
 * Type: Seed Data Module
 */

import type { ContactType } from "@prisma/client";

export const seedContactDetails: Array<{
  type: ContactType;
  label: string;
  value: string;
  link: string | null;
  order: number;
}> = [
  {
    type: "ADDRESS",
    label: "Training Centre",
    value:
      "129 & 129-01, Jalan Sierra Perdana 4, Taman Sierra Perdana, 81750 Masai, Johor Malaysia",
    link: null,
    order: 0,
  },
  {
    type: "PHONE",
    label: "Main Office",
    value: "+607 386 1617",
    link: "+601172633456",
    order: 1,
  },
  {
    type: "WHATSAPP",
    label: "WhatsApp Support",
    value: "+60 11-7263 3456",
    link: "601172633456",
    order: 2,
  },
  {
    type: "EMAIL",
    label: "Admissions Email",
    value: "anna@altair.academy",
    link: null,
    order: 3,
  },
  {
    type: "HOURS",
    label: "Office Hours",
    value: "Mon – Fri, 9:00am – 6:00pm (SST)",
    link: null,
    order: 4,
  },
  {
    type: "SOCIAL",
    label: "Facebook",
    value: "Facebook",
    link: "https://facebook.com",
    order: 5,
  },
  {
    type: "SOCIAL",
    label: "LinkedIn",
    value: "LinkedIn",
    link: "https://linkedin.com",
    order: 6,
  },
  {
    type: "SOCIAL",
    label: "Instagram",
    value: "Instagram",
    link: "https://instagram.com",
    order: 7,
  },
  {
    type: "SOCIAL",
    label: "X",
    value: "X",
    link: "https://x.com",
    order: 8,
  },
  {
    type: "SOCIAL",
    label: "YouTube",
    value: "YouTube",
    link: "https://youtube.com",
    order: 9,
  },
];
