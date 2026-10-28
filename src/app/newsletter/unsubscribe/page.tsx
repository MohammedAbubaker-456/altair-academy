/**
 * Newsletter Unsubscribe Page
 *
 * Public unindexed page for newsletter unsubscription confirmation.
 * Validates subscriber tokens and renders either a neutral invalid link notice
 * or the unsubscription confirmation form.
 *
 * Location: src/app/newsletter/unsubscribe/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter | Altair Academy",
  robots: {
    index: false,
    follow: false,
  },
};

interface UnsubscribePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const resolvedParams = await searchParams;
  const token = (resolvedParams.token ?? "").trim();

  // If no token provided or token format is invalid, render neutral invalid link state
  if (!token || token.length < 16) {
    return (
      <PageShell eyebrow="Newsletter" title="Unsubscribe">
        <div className="max-w-xl mx-auto">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                This link is not valid.
              </h2>
              <p className="text-sm text-muted-foreground">
                The unsubscription link you used may have expired or is incomplete. If you continue to receive unwanted emails, please contact our support team.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // Look up subscriber by the unique URL-safe token
  const subscriber = await db.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, status: true },
  });

  if (!subscriber) {
    return (
      <PageShell eyebrow="Newsletter" title="Unsubscribe">
        <div className="max-w-xl mx-auto">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                This link is not valid.
              </h2>
              <p className="text-sm text-muted-foreground">
                The unsubscription link you used may have expired or is incomplete. If you continue to receive unwanted emails, please contact our support team.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Newsletter"
      title="Unsubscribe from Updates"
      intro="Manage your communication preferences for Altair Academy announcements."
    >
      <div className="max-w-xl mx-auto">
        <UnsubscribeForm
          token={token}
          alreadyUnsubscribed={subscriber.status === "UNSUBSCRIBED"}
        />
      </div>
    </PageShell>
  );
}
