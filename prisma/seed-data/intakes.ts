/**
 * Seed Data: Upcoming Intakes
 *
 * Baseline scheduled training intakes for database initialization.
 * Converts legacy human-readable dates into ISO calendar date strings (YYYY-MM-DD)
 * while preserving title, location, points, and sequencing order.
 *
 * Location: prisma/seed-data/intakes.ts
 * Type: Seed Data Module
 */

const MONTH_MAP: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function parseSeedDateString(dateStr: string): string {
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error(`Failed to parse seed date "${dateStr}": expected "DD Month YYYY" format`);
  }
  const [dayStr, monthStr, yearStr] = parts;
  const dayNum = parseInt(dayStr!, 10);
  const yearNum = parseInt(yearStr!, 10);
  const monthNum = MONTH_MAP[monthStr!.toLowerCase()];

  if (!monthNum || isNaN(dayNum) || isNaN(yearNum)) {
    throw new Error(`Failed to parse seed date "${dateStr}": invalid month, day, or year`);
  }
  const formattedDay = String(dayNum).padStart(2, "0");
  const formattedYear = String(yearNum);
  return `${formattedYear}-${monthNum}-${formattedDay}`;
}

const rawSeedUpcomingSessions = [
  {
    date: "12 October 2026",
    title: "Visual Testing (VT) Level 1",
    location: "Kuala Lumpur Centre",
    points: ["3-day intensive schedule", "Practical exam included", "Seats limited to 12"],
  },
  {
    date: "26 October 2026",
    title: "Weld Inspection Intensive",
    location: "Kuala Lumpur Centre",
    points: ["5-day supervisory track", "Code interpretation labs", "Certificate on completion"],
  },
  {
    date: "9 November 2026",
    title: "ISO 50001 Awareness",
    location: "Live online classroom",
    points: ["2-day awareness course", "Live Q&A with auditors", "Template pack provided"],
  },
  {
    date: "23 November 2026",
    title: "Asset Assessment with BIM",
    location: "Kuala Lumpur Centre",
    points: ["4-day applied workshop", "Real project datasets", "Software walkthroughs"],
  },
];

export const seedUpcomingIntakes = rawSeedUpcomingSessions.map((session, index) => {
  const isoDate = parseSeedDateString(session.date);
  return {
    title: session.title,
    startDate: isoDate,
    endDate: isoDate,
    location: session.location,
    points: session.points,
    order: index + 1,
  };
});

