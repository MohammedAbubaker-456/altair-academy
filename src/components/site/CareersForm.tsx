/**
 * Careers Application Form Component
 *
 * Client Component for submitting instructor and candidate applications with resumes.
 * Powered by React useActionState and submitApplication Server Action.
 * Includes honeypot bot trap, per-field error messages, and automatic form resets.
 *
 * Location: src/components/site/CareersForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitApplication, type ApplicationFormState } from "@/app/careers/actions";

const initialState: ApplicationFormState = {
  ok: false,
};

export function CareersForm() {
  const [state, formAction, isPending] = React.useActionState(submitApplication, initialState);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Reset form and file selection when application successfully saves
  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setFileName(null);
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {/* General error banner if unassociated with a specific field */}
      {!state.ok && state.message && !state.fieldErrors && (
        <div className="mb-5 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-2.5">
          <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-medium">{state.message}</p>
        </div>
      )}

      {/* Honeypot field (hidden from real users) */}
      <div className="sr-only" aria-hidden="true">
        <Label htmlFor="career-website">Website</Label>
        <input id="career-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-name">Name</Label>
          <Input
            id="career-name"
            name="name"
            required
            placeholder="Full name"
            disabled={isPending}
          />
          {state.fieldErrors?.["name"] && (
            <p className="text-xs text-destructive">{state.fieldErrors["name"][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-email">Email</Label>
          <Input
            id="career-email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            disabled={isPending}
          />
          {state.fieldErrors?.["email"] && (
            <p className="text-xs text-destructive">{state.fieldErrors["email"][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-phone">Contact number</Label>
          <Input
            id="career-phone"
            name="phone"
            required
            placeholder="+60 12 345 6789"
            disabled={isPending}
          />
          {state.fieldErrors?.["phone"] && (
            <p className="text-xs text-destructive">{state.fieldErrors["phone"][0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-specialisation">Specialisation</Label>
          <Input
            id="career-specialisation"
            name="specialisation"
            placeholder="e.g. UT Level III"
            disabled={isPending}
          />
          {state.fieldErrors?.["specialisation"] && (
            <p className="text-xs text-destructive">{state.fieldErrors["specialisation"][0]}</p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="career-message">Message</Label>
        <Textarea
          id="career-message"
          name="message"
          rows={5}
          placeholder="Tell us about your experience and certifications"
          disabled={isPending}
        />
        {state.fieldErrors?.["message"] && (
          <p className="text-xs text-destructive">{state.fieldErrors["message"][0]}</p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="career-resume">Upload your resume</Label>
        <label
          htmlFor="career-resume"
          className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-brand-red/60 hover:text-primary"
        >
          <Upload className="size-5 text-brand-red" aria-hidden="true" />
          <span className="truncate">{fileName ?? "Choose a PDF or Word document"}</span>
        </label>
        <input
          id="career-resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          disabled={isPending}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        {state.fieldErrors?.["resume"] && (
          <p className="text-xs text-destructive">{state.fieldErrors["resume"][0]}</p>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        By submitting this form you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>

      <Button
        type="submit"
        variant="cta"
        size="lg"
        // className="mt-6 w-full text-black bg-secondary/40 font-semibold"
        className="mt-6 w-full text-black bg-secondary/40 hover:bg-secondary/60 font-semibold"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Application...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>

      {state.ok && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {state.message ||
            "Thanks — your application has been noted. Our team will be in touch shortly."}
        </p>
      )}
    </form>
  );
}
