import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Altair Academy",
  description:
    "Enrolment, payment, rescheduling and cancellation terms for Altair Academy training courses.",
  openGraph: {
    title: "Terms of Service — Altair Academy",
    description: "Enrolment, payment and cancellation terms.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function TermsPage() {
  return (
    <PageShell eyebrow="Legal" title="Terms of Service">
      <div className="max-w-3xl space-y-4 text-base text-muted-foreground">
        <p>
          A seat is confirmed once payment or an official purchase order is received. Fees cover
          tuition, course material and one examination attempt unless stated otherwise.
        </p>
        <p>
          Rescheduling is free up to 14 days before the course start date. Cancellations inside 7
          days are charged at 50% of the course fee.
        </p>
        <p>
          Altair Academy may reschedule a course if minimum enrolment is not met; in that case you
          may transfer to another intake or receive a full refund.
        </p>
      </div>
    </PageShell>
  );
}
