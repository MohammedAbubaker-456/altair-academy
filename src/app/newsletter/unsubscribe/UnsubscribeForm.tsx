/**
 * Newsletter Unsubscribe Confirmation Component
 *
 * Client Component for confirming newsletter unsubscription.
 * Invokes the confirmUnsubscribe Server Action and renders success/error state.
 *
 * Location: src/app/newsletter/unsubscribe/UnsubscribeForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmUnsubscribe } from "@/app/newsletter/actions";

interface UnsubscribeFormProps {
  token: string;
  alreadyUnsubscribed?: boolean;
}

export function UnsubscribeForm({ token, alreadyUnsubscribed = false }: UnsubscribeFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [isDone, setIsDone] = React.useState(alreadyUnsubscribed);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleConfirm = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await confirmUnsubscribe(token);
      if (result.ok) {
        setIsDone(true);
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  if (isDone) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            You have been unsubscribed.
          </h2>
          <p className="text-sm text-muted-foreground">
            You will no longer receive newsletter announcements, course intake updates, or
            accreditation news from Altair Academy.
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          If this was done in error, you can re-subscribe at any time from our website footer.
        </p>
        <div className="pt-2">
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          Confirm Unsubscription
        </h2>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to unsubscribe from Altair Academy newsletter communications? You
          will miss out on upcoming training intakes and certification schedules.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirm}
          disabled={isPending}
          className="min-h-[44px] font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Unsubscribing...
            </>
          ) : (
            "Yes, Unsubscribe Me"
          )}
        </Button>
        <Button variant="outline" asChild className="min-h-[44px]">
          <Link href="/">Cancel &amp; Keep Subscription</Link>
        </Button>
      </div>
    </div>
  );
}
