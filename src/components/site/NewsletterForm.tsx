/**
 * Public Newsletter Subscription Form Component
 *
 * Client Component rendered within the public footer.
 * Features React useActionState form binding, honeypot spam protection,
 * ARIA live region status messaging, accessible 44px touch targets,
 * and seamless integration with footer color tokens.
 *
 * Location: src/components/site/NewsletterForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { subscribeNewsletter, type NewsletterFormState } from "@/app/newsletter/actions";

interface NewsletterFormProps {
  privacyHref?: string;
  className?: string;
}

const initialState: NewsletterFormState = {
  ok: false,
};

export function NewsletterForm({ privacyHref = "/privacy", className }: NewsletterFormProps) {
  const [state, formAction, isPending] = React.useActionState(subscribeNewsletter, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Automatically reset the form input upon successful subscription
  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <div className={className}>
      <h3 className="font-display text-sm font-bold tracking-widest uppercase text-primary-foreground">
        Subscribe to our newsletter
      </h3>

      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        {/* Honeypot field (hidden from assistive tech and real visitors) */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="newsletter-website">Website</label>
          <input
            id="newsletter-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              placeholder="Enter your email"
              aria-label="Email address"
              className="w-full min-h-[44px] rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 transition-colors focus:border-brand-red focus:bg-primary-foreground/15 focus:outline-none focus:ring-1 focus:ring-brand-red disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-red px-5 py-2 text-sm font-semibold text-brand-red-foreground shadow-sm transition-colors hover:bg-brand-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>

        {/* Aria-live status region for success and validation feedback */}
        <div aria-live="polite" role="status">
          {state.ok && (
            <div className="rounded-md border border-emerald-400/30 bg-emerald-500/15 p-2.5 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{state.message || "Thanks for subscribing!"}</span>
            </div>
          )}

          {!state.ok && state.message && (
            <div className="rounded-md border border-destructive/40 bg-destructive/20 p-2.5 text-xs text-destructive-foreground flex items-center gap-2">
              <AlertCircle
                className="size-4 shrink-0 text-destructive-foreground"
                aria-hidden="true"
              />
              <span>{state.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-primary-foreground/70">
            Stay updated on new course intakes, accreditation news and training updates.
          </p>
          <p className="text-xs text-primary-foreground/60">
            By subscribing you agree to our{" "}
            <Link
              href={privacyHref}
              className="underline underline-offset-2 hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
