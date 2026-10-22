import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Altair Academy" },
      {
        name: "description",
        content: "Enrolment, payment, rescheduling and cancellation terms for Altair Academy training courses.",
      },
      { property: "og:title", content: "Terms of Service — Altair Academy" },
      { property: "og:description", content: "Enrolment, payment and cancellation terms." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell eyebrow="Legal" title="Terms of Service">
      <div className="max-w-3xl space-y-4 text-base text-muted-foreground">
        <p>
          A seat is confirmed once payment or an official purchase order is received. Fees cover tuition,
          course material and one examination attempt unless stated otherwise.
        </p>
        <p>
          Rescheduling is free up to 14 days before the course start date. Cancellations inside 7 days are
          charged at 50% of the course fee.
        </p>
        <p>
          Altair Academy may reschedule a course if minimum enrolment is not met; in that case you may transfer
          to another intake or receive a full refund.
        </p>
      </div>
    </PageShell>
  );
}
