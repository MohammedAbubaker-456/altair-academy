/**
 * News Story Card Component
 *
 * Reusable card rendering an individual news story with responsive image,
 * publication date, method tags, and navigation link to /news/[slug].
 *
 * Location: src/components/site/NewsStoryCard.tsx
 * Type: Server Component
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatNewsDate } from "@/lib/format";

export interface NewsStoryItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  publishedAt: Date | string;
  tags: string[];
}

interface NewsStoryCardProps {
  story: NewsStoryItem;
  className?: string;
}

export function NewsStoryCard({ story, className }: NewsStoryCardProps) {
  return (
    <article className={`group flex flex-col justify-between ${className ?? ""}`}>
      <div>
        <Link href={`/news/${story.slug}`} className="block relative pr-6 pb-6 overflow-hidden">
          {story.image ? (
            <Image
              src={story.image}
              alt={story.title}
              width={640}
              height={420}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-52 w-full bg-secondary" />
          )}
          <span className="absolute right-0 bottom-0 h-14 w-20 bg-background" aria-hidden="true" />
        </Link>
        <h3 className="font-display text-xl leading-snug font-bold text-primary transition-colors group-hover:text-brand-red">
          <Link href={`/news/${story.slug}`}>{story.title}</Link>
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <span>{formatNewsDate(story.publishedAt)}</span>
          {story.tags.length > 0 ? (
            <>
              <span className="text-brand-red">•</span>
              <span>{story.tags.join(", ")}</span>
            </>
          ) : null}
        </div>
        <span className="mt-3 block h-px w-10 bg-brand-red/60" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{story.excerpt}</p>
      </div>
      <div>
        <Link
          href={`/news/${story.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-brand-red uppercase"
        >
          Read more
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
