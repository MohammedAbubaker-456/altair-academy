/**
 * Public Newsletter Server Actions
 *
 * Handles newsletter subscription from the public footer and token-based
 * unsubscribe requests. Implements Zod validation, honeypot spam protection,
 * HMAC rate limiting, and neutral responses to prevent email enumeration.
 *
 * Location: src/app/newsletter/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation/newsletter";
import { checkRateLimit, recordRateLimitAttempt } from "@/lib/rate-limit";

export interface NewsletterFormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface UnsubscribeResult {
  ok: boolean;
  message: string;
}

/**
 * Handles public newsletter subscription submissions from the footer form.
 * Returns identical neutral success responses regardless of whether the email
 * was freshly created or previously registered.
 */
export async function subscribeNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const rawInput = {
    email: (formData.get("email") as string) ?? "",
    website: (formData.get("website") as string) ?? "",
  };

  // 1. Validate email address and honeypot
  const parseResult = newsletterSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstErr = Object.values(fieldErrors).flat()[0];
    return {
      ok: false,
      message: firstErr || "Please enter a valid email address.",
      fieldErrors,
    };
  }

  const { email, website } = parseResult.data;

  // 2. Honeypot check: If the hidden honeypot field is filled, pretend success without storing
  if (website && website.trim() !== "") {
    return {
      ok: true,
      message: "Thanks for subscribing!",
    };
  }

  // 3. Rate limiting check (5 subscription attempts per hour per client)
  const rateLimit = await checkRateLimit("newsletter");
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: rateLimit.message,
    };
  }

  try {
    // 4. Record the attempt towards rate limit
    await recordRateLimitAttempt("newsletter");

    // 5. Look up existing subscriber (case-insensitive via lowercased email)
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "UNSUBSCRIBED") {
        // Reactivate previously unsubscribed contact
        await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            unsubscribedAt: null,
          },
        });
        revalidatePath("/admin");
        revalidatePath("/admin/subscribers");
      }
      // If already ACTIVE, change nothing
    } else {
      // 6. Generate cryptographically secure URL-safe unsubscribe token (43 chars)
      const unsubscribeToken = crypto.randomBytes(32).toString("base64url");

      await db.newsletterSubscriber.create({
        data: {
          email,
          status: "ACTIVE",
          source: "footer",
          unsubscribeToken,
        },
      });

      revalidatePath("/admin");
      revalidatePath("/admin/subscribers");
    }

    return {
      ok: true,
      message: "Thanks for subscribing!",
    };
  } catch (error) {
    // Do not log subscriber emails in error outputs to preserve privacy
    console.error(
      "[subscribeNewsletter] Unexpected subscription error:",
      error instanceof Error ? error.message : "Database error",
    );
    return {
      ok: false,
      message: "An unexpected error occurred while processing your subscription. Please try again.",
    };
  }
}

/**
 * Handles confirmation of unsubscription using a unique URL-safe token.
 */
export async function confirmUnsubscribe(token: string): Promise<UnsubscribeResult> {
  if (!token || typeof token !== "string" || token.trim().length < 16) {
    return {
      ok: false,
      message: "This link is not valid.",
    };
  }

  try {
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token.trim() },
    });

    if (!subscriber) {
      return {
        ok: false,
        message: "This link is not valid.",
      };
    }

    if (subscriber.status !== "UNSUBSCRIBED") {
      await db.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
        },
      });

      revalidatePath("/admin");
      revalidatePath("/admin/subscribers");
    }

    return {
      ok: true,
      message: "You have been unsubscribed.",
    };
  } catch (error) {
    console.error(
      "[confirmUnsubscribe] Unsubscribe error:",
      error instanceof Error ? error.message : "Database error",
    );
    return {
      ok: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
