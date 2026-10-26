/**
 * Public Queries: Contact Details
 *
 * Fetches active contact information for the footer, contact page, careers, calendar, and home page.
 * Returns structured entries grouped by ContactType and a legacy shape adapter.
 * No silent fallbacks to hardcoded values: deactivated entries disappear immediately.
 *
 * Location: src/server/queries/contact.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";
import type { ContactType, Status } from "@prisma/client";

export interface ContactDetailDTO {
  id: string;
  type: ContactType;
  label: string | null;
  value: string;
  link: string | null;
  order: number;
  status: Status;
}

export interface GroupedContactDetails {
  ADDRESS: ContactDetailDTO[];
  PHONE: ContactDetailDTO[];
  WHATSAPP: ContactDetailDTO[];
  EMAIL: ContactDetailDTO[];
  HOURS: ContactDetailDTO[];
  SOCIAL: ContactDetailDTO[];
}

export interface LegacyContactInfo {
  address?: string | undefined;
  phoneDisplay?: string | undefined;
  phoneHref?: string | undefined;
  homepagePhoneDisplay?: string | undefined;
  whatsapp?: string | undefined;
  email?: string | undefined;
  hours?: string | undefined;
}

export async function getContactDetails(): Promise<GroupedContactDetails> {
  const records = await db.contactDetail.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      order: "asc",
    },
  });

  const grouped: GroupedContactDetails = {
    ADDRESS: [],
    PHONE: [],
    WHATSAPP: [],
    EMAIL: [],
    HOURS: [],
    SOCIAL: [],
  };

  for (const record of records) {
    if (grouped[record.type]) {
      grouped[record.type].push({
        id: record.id,
        type: record.type,
        label: record.label,
        value: record.value,
        link: record.link,
        order: record.order,
        status: record.status,
      });
    }
  }

  return grouped;
}

export async function getContactInfo(): Promise<LegacyContactInfo> {
  const grouped = await getContactDetails();

  const firstAddress = grouped.ADDRESS[0];
  const firstPhone = grouped.PHONE[0];
  const firstWhatsapp = grouped.WHATSAPP[0];
  const firstEmail = grouped.EMAIL[0];
  const firstHours = grouped.HOURS[0];

  return {
    address: firstAddress?.value,
    phoneDisplay: firstPhone?.value,
    phoneHref: firstPhone?.link || firstPhone?.value,
    homepagePhoneDisplay: firstPhone?.value,
    whatsapp: firstWhatsapp?.link || firstWhatsapp?.value,
    email: firstEmail?.value,
    hours: firstHours?.value,
  };
}
