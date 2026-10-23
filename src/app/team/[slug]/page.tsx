import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/PageShell";
import { team } from "@/data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return team.map((member) => ({
    slug: member.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = team.find((m) => m.slug === slug);
  if (!member) {
    return {
      title: "Profile unavailable — Altair Academy",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${member.name}, ${member.role} — Altair Academy`,
    description: member.bio,
    openGraph: {
      title: `${member.name} — Altair Academy`,
      description: member.bio,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = team.find((m) => m.slug === slug);
  if (!member) notFound();

  return (
    <PageShell eyebrow="Management Team" title={member.name} intro={member.role}>
      <div className="grid gap-10 md:grid-cols-3">
        <Image
          src={member.image}
          alt={member.name}
          width={800}
          height={800}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="w-full rounded-lg object-cover"
        />
        <p className="text-base text-muted-foreground md:col-span-2">{member.bio}</p>
      </div>
    </PageShell>
  );
}
