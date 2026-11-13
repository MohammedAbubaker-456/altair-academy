/**
 * Public Upcoming Intake Card Component
 *
 * Renders an upcoming training intake with formatted date range,
 * location, highlights, and direct seat reservation action.
 * Zero hooks and zero server-only imports, safe for both SSR and client preview.
 *
 * Location: src/components/site/IntakeCard.tsx
 * Type: Shared Presentational Component
 */

import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIntakeDateRange } from "@/lib/date";

export interface IntakeCardItem {
  id?: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  location: string;
  points: string[];
}

interface IntakeCardProps {
  intake: IntakeCardItem;
}

export function IntakeCard({ intake }: IntakeCardProps) {
  const formattedDate = formatIntakeDateRange(intake.startDate, intake.endDate);

  return (
    <article className="card-lift flex flex-col rounded-xl border border-border bg-card p-5">
      <span className="eyebrow">{formattedDate}</span>
      <h3 className="mt-2 font-display text-base font-bold text-primary">{intake.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-brand-red" aria-hidden="true" />
        {intake.location}
      </p>
      <ul className="mt-4 flex-1 space-y-1.5">
        {intake.points.map((point, index) => (
          <li
            key={`${point}-${index}`}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <Button variant="ctaOutline" size="default" className="mt-5 w-full text-base" asChild>
        <Link href="/contact">Reserve a Seat</Link>
      </Button>
    </article>
  );
}
