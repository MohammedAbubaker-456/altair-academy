/**
 * Public News Detail Article Page
 *
 * Dynamic Server Component rendering an individual news post by its slug.
 * Features full Markdown body content, hero photography, safe schema JSON-LD,
 * and a curated grid of recent stories.
 *
 * Location: src/app/news/[slug]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeader } from "@/components/site/SectionHeader";
import { NewsStoryCard } from "@/components/site/NewsStoryCard";
import { MarkdownContent } from "@/components/site/MarkdownContent";
import { getNewsPostBySlug, getLatestNewsExcluding } from "@/server/queries/news";
import { getPageMetadata } from "@/server/seo";
import { formatNewsDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post || post.status !== "ACTIVE") {
    return {
      title: "News Post Not Found — Altair Academy",
    };
  }

  const siteUrl = process.env["SITE_URL"]?.trim().replace(/\/+$/, "");
  const canonicalUrl = siteUrl ? `${siteUrl}/news/${post.slug}` : `/news/${post.slug}`;

  return getPageMetadata("news-detail", {
    record: {
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogImage: post.ogImage || post.image,
    },
    replacements: {
      "{title}": post.title,
      "{excerpt}": post.excerpt,
      "{category}": post.category ?? "",
    },
    canonicalPath: canonicalUrl,
    publishedTime: post.publishedAt.toISOString(),
    imageAlt: post.title,
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post || post.status !== "ACTIVE") {
    notFound();
  }

  const siteUrl = process.env["SITE_URL"]?.trim().replace(/\/+$/, "");
  const latestStories = await getLatestNewsExcluding(post.id, 3);

  // Safely construct NewsArticle JSON-LD only when SITE_URL is configured
  let jsonLdScript: string | null = null;
  if (siteUrl) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl}/news/${post.slug}`,
      },
      publisher: {
        "@type": "Organization",
        name: "Altair Academy",
        url: siteUrl,
      },
      ...(post.image
        ? {
            image: [post.image.startsWith("http") ? post.image : `${siteUrl}${post.image}`],
          }
        : {}),
    };
    // Escape '<' to prevent script injection in serialized JSON-LD
    jsonLdScript = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {jsonLdScript && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      )}
      <Header />
      <main className="flex-1">
        {/* Article Header & Navigation */}
        <section className="bg-navy py-12 text-primary-foreground sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-red-foreground/90 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to news
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatNewsDate(post.publishedAt)}
              </span>
              {post.category && (
                <>
                  <span className="text-brand-red">•</span>
                  <span className="text-brand-red-foreground font-bold">{post.category}</span>
                </>
              )}
              {post.tags.length > 0 && (
                <>
                  <span className="text-brand-red">•</span>
                  <span className="inline-flex items-center gap-1 opacity-90">
                    <Tag className="size-3" />
                    {post.tags.join(", ")}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80 sm:text-lg border-l-2 border-brand-red pl-4">
              {post.excerpt}
            </p>
          </div>
        </section>

        {/* Article Body */}
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {post.image && (
            <div className="relative mb-10 overflow-hidden rounded-2xl shadow-md border border-border">
              <Image
                src={post.image}
                alt={post.title}
                width={1200}
                height={630}
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="aspect-16/9 w-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <MarkdownContent content={post.body || post.excerpt} />
          </div>
        </article>

        {/* Latest Stories Section */}
        {latestStories.length > 0 && (
          <section className="border-t border-border bg-secondary/30 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                label="Keep Reading"
                title="Latest Stories"
                description="Explore more news, course schedules, and inspection insights."
              />

              <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {latestStories.map((story) => (
                  <NewsStoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
