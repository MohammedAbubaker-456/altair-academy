/**
 * Public Terms of Service Legal Page
 *
 * Server Component rendering database-backed Terms of Service content.
 * Performs server-side token replacement from active contact details.
 *
 * Location: src/app/terms/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { MarkdownContent } from "@/components/site/MarkdownContent";
import { getActiveLegalPageBySlug, replaceLegalTokens } from "@/server/queries/legal";
import { getContactInfo } from "@/server/queries/contact";
import { getPageMetadata } from "@/server/seo";

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
  const page = await getActiveLegalPageBySlug("terms");
  if (!page) {
    return getPageMetadata("terms");
  }

  const description = getExcerpt(page.body, page.metaDescription);

  return getPageMetadata("terms", {
    record: {
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
    },
    dynamicDefaults: {
      title: `${page.title} — Altair Academy`,
      description,
      ogTitle: `${page.title} — Altair Academy`,
      ogDescription: description,
    },
  });
}

export default async function TermsPage() {
  const [page, contactInfo] = await Promise.all([
    getActiveLegalPageBySlug("terms"),
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
