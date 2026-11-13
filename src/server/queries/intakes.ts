/**
 * Public Queries: Upcoming Intakes
 *
 * Fetches active upcoming intakes whose end date is on or after today (Asia/Kuala_Lumpur),
 * ordered chronologically for display in the home page "Training calendar" section.
 *
 * Location: src/server/queries/intakes.ts
 * Type: Server-Only Data Access Module
 */

import "server-only";
import { db } from "@/lib/db";
import { getTodayDateString } from "@/lib/date";
import { readList } from "@/lib/lists";

export interface UpcomingIntakeDTO {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  points: string[];
}

export async function getUpcomingIntakes(limit: number = 4): Promise<UpcomingIntakeDTO[]> {
  const today = getTodayDateString("Asia/Kuala_Lumpur");

  const rows = await db.upcomingIntake.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: today,
      },
    },
    orderBy: [{ startDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      location: true,
      points: true,
    },
  });

  return rows.map((r) => ({
    ...r,
    points: readList(r.points),
  }));
}
