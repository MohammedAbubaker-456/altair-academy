/**
 * Public Contact Enquiry Form Component
 *
 * Client Component handling contact inquiries. Stores lead in MongoDB via Server Action,
 * applies client and server validation, handles popup-blocker safe WhatsApp redirects,
 * and falls back gracefully when WhatsApp is disabled or blocked.
 *
 * Location: src/components/site/ContactForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { leadSchema } from "@/lib/validation/lead";
import { createLead } from "@/app/contact/actions";

interface ContactFormProps {
  hasWhatsapp: boolean;
  whatsappDigits?: string | undefined;
}

export function ContactForm({ hasWhatsapp, whatsappDigits }: ContactFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState(""); // Honeypot
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [fallbackWaUrl, setFallbackWaUrl] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setFallbackWaUrl(null);

    // 1. Pre-open a blank tab synchronously inside the user click to prevent popup blockers
    let waWindow: Window | null = null;
    if (hasWhatsapp && typeof window !== "undefined") {
      try {
        waWindow = window.open("about:blank", "_blank");
      } catch {
        waWindow = null;
      }
    }

    // 2. Client-side validation using shared Zod schema
    const rawInput = { name, email, phone, message, website };
    const parseResult = leadSchema.safeParse(rawInput);

    if (!parseResult.success) {
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
      const flattened = parseResult.error.flatten().fieldErrors;
      setFieldErrors(flattened);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createLead(rawInput);

      if (result.ok) {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setWebsite("");
        setFieldErrors({});

        if (result.whatsappUrl) {
          if (waWindow && !waWindow.closed) {
            waWindow.location.href = result.whatsappUrl;
          } else if (typeof window !== "undefined") {
            window.open(result.whatsappUrl, "_blank");
          }
        } else if (waWindow && !waWindow.closed) {
          waWindow.close();
        }
      } else {
        if (waWindow && !waWindow.closed) {
          waWindow.close();
        }
        setGeneralError(result.message);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }

        // Generate fallback direct link if WhatsApp is active
        if (hasWhatsapp && whatsappDigits) {
          const text = encodeURIComponent(`Hello Altair Academy, I am ${name}. ${message}`);
          setFallbackWaUrl(`https://wa.me/${whatsappDigits}?text=${text}`);
        }
      }
    } catch (err) {
      console.error("[ContactForm] Submit error:", err);
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
      setGeneralError("An unexpected error occurred. Please try again.");
      if (hasWhatsapp && whatsappDigits) {
        const text = encodeURIComponent(`Hello Altair Academy, I am ${name}. ${message}`);
        setFallbackWaUrl(`https://wa.me/${whatsappDigits}?text=${text}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold tracking-tight text-primary">
          Send us a message
        </h2>
        <p className="text-sm text-muted-foreground">
          {hasWhatsapp
            ? "Fill in your details and continue on WhatsApp. A course manager will reply directly."
            : "Fill in your details below and a course manager will reply directly."}
        </p>
      </div>

      {isSuccess && (
        <div className="mt-5 rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Thank you for reaching out!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {hasWhatsapp
                  ? "Your inquiry has been recorded and your WhatsApp chat is ready."
                  : "Your inquiry has been received. Our team will contact you shortly."}
              </p>
            </div>
          </div>
        </div>
      )}

      {generalError && (
        <div className="mt-5 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">{generalError}</p>
              {fallbackWaUrl && (
                <p className="text-xs">
                  <a
                    href={fallbackWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground font-medium"
                  >
                    Continue to WhatsApp anyway &rarr;
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Honeypot field - invisible to humans */}
        <div className="sr-only" aria-hidden="true">
          <Label htmlFor="contact-website">Website</Label>
          <input
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />
          {fieldErrors["name"] && (
            <p className="text-xs text-destructive">{fieldErrors["name"][0]}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors["email"] && (
              <p className="text-xs text-destructive">{fieldErrors["email"][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">Phone number</Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="+60 12 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors["phone"] && (
              <p className="text-xs text-destructive">{fieldErrors["phone"][0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            rows={4}
            placeholder="Tell us about your training requirements, cohort size, or certification goals..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            required
          />
          {fieldErrors["message"] && (
            <p className="text-xs text-destructive">{fieldErrors["message"][0]}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          By submitting this form you agree to our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>

        <Button
          type="submit"
          variant="cta"
          className="w-full text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : hasWhatsapp ? (
            <>
              <MessageCircle className="size-4 mr-2" />
              Chat on WhatsApp
            </>
          ) : (
            "Send message"
          )}
        </Button>
      </form>
    </div>
  );
}
