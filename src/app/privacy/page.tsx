/**
 * Public Privacy Policy Legal Page
 *
 * Server Component rendering database-backed Privacy Policy content.
 * Performs server-side token replacement (e.g. {{email}}) from active contact details.
 *
 * Location: src/app/privacy/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { MarkdownContent } from "@/components/site/MarkdownContent";
import { getActiveLegalPageBySlug, replaceLegalTokens } from "@/server/queries/legal";
import { getContactInfo } from "@/server/queries/contact";

export const dynamic = "force-dynamic";

function getExcerpt(body: string, metaDescription?: string | null): string {
  if (metaDescription && metaDescription.trim()) {
    return metaDescription.trim();
  }
  const plain = body
    .replace(/[#*`~_[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getActiveLegalPageBySlug("privacy");
  if (!page) {
    return {
      title: "Privacy Policy — Altair Academy",
    };
  }

  const description = getExcerpt(page.body, page.metaDescription);

  return {
    title: `${page.title} — Altair Academy`,
    description,
    openGraph: {
      title: `${page.title} — Altair Academy`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PrivacyPage() {
  const [page, contactInfo] = await Promise.all([
    getActiveLegalPageBySlug("privacy"),
    getContactInfo(),
  ]);

  if (!page) {
    notFound();
  }

  const renderedBody = replaceLegalTokens(page.body, contactInfo);

  return (
    <PageShell eyebrow="Legal" title={page.title}>
      <div className="max-w-3xl">
        <MarkdownContent content={renderedBody} />
      </div>
    </PageShell>
  );
}
