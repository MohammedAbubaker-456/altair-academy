/**
 * Dynamic Legal Page Route
 *
 * Renders database-backed custom legal pages.
 * Enforces 308 permanent redirects from /legal/privacy and /legal/terms
 * to their canonical root paths (/privacy and /terms).
 *
 * Location: src/app/legal/[slug]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { MarkdownContent } from "@/components/site/MarkdownContent";
import { getActiveLegalPageBySlug, replaceLegalTokens } from "@/server/queries/legal";
import { getContactInfo } from "@/server/queries/contact";

export const dynamic = "force-dynamic";

interface LegalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

export async function generateMetadata({ params }: LegalDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "privacy" || slug === "terms") {
    return {};
  }

  const page = await getActiveLegalPageBySlug(slug);
  if (!page) {
    return {
      title: "Page Not Found — Altair Academy",
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

export default async function DynamicLegalPage({ params }: LegalDetailPageProps) {
  const { slug } = await params;

  // 308 Permanent Redirect for canonical core legal pages
  if (slug === "privacy") {
    permanentRedirect("/privacy");
  }
  if (slug === "terms") {
    permanentRedirect("/terms");
  }

  const [page, contactInfo] = await Promise.all([getActiveLegalPageBySlug(slug), getContactInfo()]);

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
