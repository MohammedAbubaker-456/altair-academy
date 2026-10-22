import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { contactInfo } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Altair Academy" },
      {
        name: "description",
        content: "How Altair Academy collects, uses and protects personal data from enquiries and enrolments.",
      },
      { property: "og:title", content: "Privacy Policy — Altair Academy" },
      { property: "og:description", content: "Our data handling practices for enquiries and enrolments." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell eyebrow="Legal" title="Privacy Policy">
      <div className="max-w-3xl space-y-4 text-base text-muted-foreground">
        <p>
          We collect only the information needed to respond to enquiries, process enrolments and issue
          certificates — typically your name, employer, contact details and course history.
        </p>
        <p>
          We do not sell personal data. Information is shared with accreditation bodies only where required to
          register a candidate or issue a certificate.
        </p>
        <p>
          To request a copy, correction or deletion of your data, contact us at {contactInfo.email}.
        </p>
      </div>
    </PageShell>
  );
}
