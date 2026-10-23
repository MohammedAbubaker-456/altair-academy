/**
 * Team Member Card Component
 *
 * Renders an executive management profile card with circular avatar, role, and profile link.
 * Supports string image URLs and provides an initials fallback when image is null.
 *
 * Location: src/components/site/TeamCard.tsx
 * Type: Server Component
 */

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/data/site";

export function TeamCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card-lift group relative flex flex-col items-center overflow-hidden rounded-lg border border-border bg-card p-6 text-center">
      <div className="size-32 overflow-hidden rounded-full border-4 border-secondary">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            width={800}
            height={800}
            sizes="128px"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-navy font-display text-2xl font-bold text-primary-foreground">
            {initials}
          </div>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-primary">
        <Link
          href={`/team/${member.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {member.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
      <Button variant="ctaOutline" size="default" className="mt-5 text-base" tabIndex={-1} asChild>
        <span>View Profile</span>
      </Button>
    </article>
  );
}
