/**
 * Seed Data: Training Calendar
 *
 * Initial dataset for NDT Level 2 courses and 2026 intake schedules.
 *
 * Location: prisma/seed-data/calendar.ts
 * Type: Seed Data Module
 */

export interface SeedCalendarCourse {
  code: string;
  name: string;
}

export interface SeedMonthSlot {
  training?: string;
  exam?: string;
}

export interface SeedMonthEntry {
  month: string;
  slots: Record<string, SeedMonthSlot>;
}

export const seedCalendarCourses: SeedCalendarCourse[] = [
  { code: "UT", name: "Ultrasonic Testing" },
  { code: "MT", name: "Magnetic Particle Testing" },
  { code: "PT", name: "Penetrant Testing" },
  { code: "PAUT", name: "Phased Array UT" },
  { code: "TOFD", name: "Time of Flight Diffraction" },
  { code: "RI", name: "Radiographic Interpretation" },
];

export const seedCalendar2026Level2: SeedMonthEntry[] = [
  { month: "February", slots: { UT: { training: "23-28" } } },
  {
    month: "March",
    slots: { UT: { training: "01-12", exam: "13-17" }, MT: { training: "24-27", exam: "30" } },
  },
  {
    month: "April",
    slots: { PT: { training: "12-15", exam: "16" }, RI: { training: "01-08", exam: "09" } },
  },
  {
    month: "May",
    slots: { MT: { training: "20-25", exam: "26" }, PAUT: { training: "04-15", exam: "18-19" } },
  },
  {
    month: "June",
    slots: { UT: { training: "02-17", exam: "18-19" }, PT: { training: "19-24", exam: "25" } },
  },
  {
    month: "July",
    slots: { MT: { training: "17-22", exam: "23" }, TOFD: { training: "01-14", exam: "15-16" } },
  },
  {
    month: "August",
    slots: { PT: { training: "12-17", exam: "18" }, RI: { training: "03-10", exam: "11" } },
  },
  {
    month: "September",
    slots: { UT: { training: "01-14", exam: "15-17" }, MT: { training: "18-23", exam: "24" } },
  },
  {
    month: "October",
    slots: { PT: { training: "18-22", exam: "23" }, PAUT: { training: "01-14", exam: "15-16" } },
  },
  {
    month: "November",
    slots: { MT: { training: "11-16", exam: "17" }, RI: { training: "02-09", exam: "10" } },
  },
  { month: "December", slots: {} },
];
