/**
 * Public Team Member Profile Page
 *
 * Server Component rendering individual executive profile details.
 * Fetches the active management team member by slug from MongoDB.
 *
 * Location: src/app/team/[slug]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { getActiveTeamMemberBySlug } from "@/server/queries/team";
import { getPageMetadata } from "@/server/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await getActiveTeamMemberBySlug(slug);
  if (!member) {
    return {
      title: "Profile unavailable — Altair Academy",
      robots: { index: false, follow: false },
    };
  }
  return getPageMetadata("team-detail", {
    record: {
      metaTitle: member.metaTitle,
      metaDescription: member.metaDescription,
    },
    replacements: {
      "{name}": member.name,
      "{role}": member.role,
      "{bio}": member.shortBio,
    },
    dynamicDefaults: {
      title: `${member.name}, ${member.role} — Altair Academy`,
      description: member.shortBio,
      ogTitle: `${member.name} — Altair Academy`,
      ogDescription: member.shortBio,
    },
  });
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = await getActiveTeamMemberBySlug(slug);
  if (!member) notFound();

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell eyebrow="Management Team" title={member.name} intro={member.role}>
      <div className="grid gap-10 md:grid-cols-3">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            width={800}
            height={800}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-navy font-display text-4xl font-bold text-primary-foreground">
            {initials}
          </div>
        )}
        <p className="text-base text-muted-foreground md:col-span-2">{member.shortBio}</p>
      </div>
    </PageShell>
  );
}
