/**
 * Public Contact Server Actions
 *
 * Handles public lead submission from /contact with input validation,
 * honeypot bot trap, HMAC rate limiting, and WhatsApp URL generation.
 *
 * Location: src/app/contact/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { leadSchema } from "@/lib/validation/lead";
import { checkRateLimit, recordRateLimitAttempt } from "@/lib/rate-limit";
import { getContactDetails } from "@/server/queries/contact";

export type CreateLeadResult =
  | { ok: true; whatsappUrl?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createLead(input: unknown): Promise<CreateLeadResult> {
  const parseResult = leadSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstErr = Object.values(fieldErrors).flat()[0];
    return {
      ok: false,
      message: firstErr || "Please verify your input and try again.",
      fieldErrors,
    };
  }

  const { name, email, phone, message, website } = parseResult.data;

  // 1. Honeypot check: If the hidden honeypot field is filled, pretend success without storing
  if (website && website.trim() !== "") {
    return { ok: true };
  }

  // 2. Rate limiting check (5 leads per hour per client)
  const rateLimit = await checkRateLimit("lead");
  if (!rateLimit.allowed) {
    return { ok: false, message: rateLimit.message };
  }

  try {
    // 3. Record the attempt towards the rate limit
    await recordRateLimitAttempt("lead");

    // 4. Persist the lead in MongoDB
    await db.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        status: "NEW",
        source: "contact-page",
      },
    });

    // 5. Revalidate admin dashboard paths
    revalidatePath("/admin");
    revalidatePath("/admin/leads");

    // 6. Check for active WhatsApp contact details
    const contactDetails = await getContactDetails();
    const activeWhatsapp = contactDetails.WHATSAPP[0];

    if (activeWhatsapp) {
      const waDigits = (activeWhatsapp.link || activeWhatsapp.value).replace(/\D/g, "");
      const textMessage = `Hello Altair Academy, I am ${name}. ${message}`;
      const whatsappUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(textMessage)}`;
      return { ok: true, whatsappUrl };
    }

    return { ok: true };
  } catch (error) {
    console.error("[createLead] Database error:", error);
    return {
      ok: false,
      message: "An unexpected error occurred while saving your message. Please try again.",
    };
  }
}
