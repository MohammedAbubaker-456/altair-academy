/**
 * Careers Application Form Component
 *
 * Client Component for submitting resumes and candidate applications.
 * Handles file selection display and submission acknowledgment status.
 *
 * Location: src/components/site/CareersForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CareersForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form
      className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-name">Name</Label>
          <Input id="career-name" name="name" required placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-email">Email</Label>
          <Input id="career-email" name="email" type="email" required placeholder="you@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-phone">Contact number</Label>
          <Input id="career-phone" name="phone" required placeholder="+60 12 345 6789" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-specialisation">Specialisation</Label>
          <Input id="career-specialisation" name="specialisation" placeholder="e.g. UT Level III" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="career-message">Message</Label>
        <Textarea
          id="career-message"
          name="message"
          rows={5}
          placeholder="Tell us about your experience and certifications"
        />
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="career-resume">Upload your resume</Label>
        <label
          htmlFor="career-resume"
          className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-brand-red/60 hover:text-primary"
        >
          <Upload className="size-5 text-brand-red" aria-hidden="true" />
          {fileName ?? "Choose a PDF or Word document"}
        </label>
        <input
          id="career-resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>
      {/* 
      <Button type="submit" variant="cta" size="lg" className="mt-6 w-full text-base">
        Submit Application
      </Button> */}
      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-red-600 px-8 py-2 text-base text-white"
      >
        Submit Application
      </button>
      {/* {submitted ? (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-red"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Thanks — your application has been noted. Our team will be in touch shortly.
        </p>
      ) : null} */}
      {submitted && (
        <p className="mt-4 text-sm text-green-600">Application submitted successfully!</p>
      )}
    </form>
  );
}
// "use client";

// export function CareersForm() {
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         console.log("Submitted");
//       }}
//     >
//       <input
//         name="name"
//         placeholder="Full name"
//       />

//       <button type="submit">
//         Submit
//       </button>
//     </form>
//   );
// }
