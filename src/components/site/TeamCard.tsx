import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/data/site";

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="card-lift group relative flex flex-col items-center overflow-hidden rounded-lg border border-border bg-card p-6 text-center">
      <div className="size-32 overflow-hidden rounded-full border-4 border-secondary">
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-primary">
        <Link
          to="/team/$slug"
          params={{ slug: member.slug }}
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
