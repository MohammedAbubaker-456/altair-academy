/**
 * Interactive Training Calendar Viewer Component
 *
 * Client Component rendering day, month, and year calendar views
 * with intake date navigation, course filtering, and reserve seat CTAs.
 * Database-backed with dynamic year selection, multi-month session spans,
 * and deterministic SSR rendering.
 *
 * Location: src/components/site/CalendarViewer.tsx
 * Type: Client Component ("use client")
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Phone,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LegacyContactInfo } from "@/server/queries/contact";
import type { CalendarCourseDTO, CalendarSessionDTO } from "@/server/queries/calendar";

type View = "day" | "month" | "year";

export type ClientSession = {
  id: string;
  courseCode: string;
  courseName: string;
  kind: "training" | "exam";
  level: string | null;
  startDateStr: string;
  endDateStr: string;
  start: Date;
  end: Date;
  timeLabel: string | null;
  location: string | null;
  note: string | null;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TRAINING_TIME = "09:00 – 17:00 SST";
const EXAM_TIME = "09:00 – 13:00 SST";

function parseLocalDate(str: string): Date {
  const parts = str.split("-").map((v) => parseInt(v, 10));
  return new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

function formatBadgeDate(start: Date, end: Date): string {
  const sYear = start.getFullYear();
  const eYear = end.getFullYear();
  const sMonth = start.getMonth();
  const eMonth = end.getMonth();
  const sDate = start.getDate();
  const eDate = end.getDate();

  // Single day
  if (sYear === eYear && sMonth === eMonth && sDate === eDate) {
    return `${sDate} ${MONTH_NAMES[sMonth]} ${sYear}`;
  }

  // Same month, same year
  if (sYear === eYear && sMonth === eMonth) {
    return `${sDate}–${eDate} ${MONTH_NAMES[sMonth]} ${sYear}`;
  }

  // Different months, same year (e.g. 28 Jan – 2 Feb 2026)
  if (sYear === eYear) {
    return `${sDate} ${MONTH_SHORT[sMonth]} – ${eDate} ${MONTH_SHORT[eMonth]} ${sYear}`;
  }

  // Different years (e.g. 28 Dec 2026 – 2 Jan 2027)
  return `${sDate} ${MONTH_SHORT[sMonth]} ${sYear} – ${eDate} ${MONTH_SHORT[eMonth]} ${eYear}`;
}

function sessionsOn(date: Date, allSessions: ClientSession[]): ClientSession[] {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return allSessions.filter((s) => {
    const start = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()).getTime();
    const end = new Date(s.end.getFullYear(), s.end.getMonth(), s.end.getDate()).getTime();
    return d >= start && d <= end;
  });
}

function sessionsInMonth(
  year: number,
  monthIdx: number,
  allSessions: ClientSession[],
): ClientSession[] {
  const monthStart = new Date(year, monthIdx, 1).getTime();
  const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999).getTime();
  return allSessions.filter((s) => {
    const start = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()).getTime();
    const end = new Date(
      s.end.getFullYear(),
      s.end.getMonth(),
      s.end.getDate(),
      23,
      59,
      59,
      999,
    ).getTime();
    return start <= monthEnd && end >= monthStart;
  });
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SessionBadge({ session }: { session: ClientSession }) {
  const training = session.kind === "training";
  const dateText = formatBadgeDate(session.start, session.end);
  const timeText = session.timeLabel?.trim()
    ? session.timeLabel.trim()
    : training
      ? TRAINING_TIME
      : EXAM_TIME;
  const details = [session.location?.trim(), session.note?.trim()].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl p-4",
        training ? "bg-navy text-primary-foreground" : "bg-brand-red text-brand-red-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        {training ? (
          <GraduationCap className="size-5 shrink-0" />
        ) : (
          <ClipboardCheck className="size-5 shrink-0" />
        )}
        <div>
          <p className="font-display text-sm font-bold">
            {session.courseCode}
            <span className="ml-2 text-xs font-normal opacity-80">{session.courseName}</span>
          </p>
          <p className="text-xs opacity-80">
            {training ? "Training" : "Examination"} · {dateText}
          </p>
          {details && <p className="mt-0.5 text-xs opacity-75">{details}</p>}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-medium shrink-0">
        <Clock className="size-3.5" />
        {timeText}
      </p>
    </div>
  );
}

const selectClass =
  "cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-ring";

export function CalendarViewer({
  contactInfo,
  courses,
  sessions,
  displayYear,
}: {
  contactInfo: LegacyContactInfo;
  courses: CalendarCourseDTO[];
  sessions: CalendarSessionDTO[];
  displayYear: number;
}) {
  const [view, setView] = useState<View>("month");
  const [day, setDay] = useState<Date>(() => new Date(displayYear, 0, 1));
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(displayYear);

  // Convert raw DTOs to client sessions with local Dates
  const clientSessions = useMemo<ClientSession[]>(() => {
    return sessions
      .map((s) => ({
        ...s,
        startDateStr: s.startDate,
        endDateStr: s.endDate,
        start: parseLocalDate(s.startDate),
        end: parseLocalDate(s.endDate),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [sessions]);

  // Distinct years that have sessions
  const availableYears = useMemo(() => {
    const set = new Set<number>([displayYear]);
    for (const s of clientSessions) {
      set.add(s.start.getFullYear());
      set.add(s.end.getFullYear());
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [clientSessions, displayYear]);

  // Client-side effect: align month/day with today if today falls in the selected year
  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === displayYear) {
      setMonth(today.getMonth());
      setYear(displayYear);
      setDay(new Date(displayYear, today.getMonth(), today.getDate()));
    }
  }, [displayYear]);

  // Distinct levels in the currently selected year
  const distinctLevelsInYear = useMemo(() => {
    const levels = new Set<string>();
    for (const s of clientSessions) {
      if (s.start.getFullYear() === year || s.end.getFullYear() === year) {
        if (s.level && s.level.trim()) {
          levels.add(s.level.trim());
        }
      }
    }
    return Array.from(levels);
  }, [clientSessions, year]);

  const levelLabel = useMemo(() => {
    if (distinctLevelsInYear.length > 0) {
      return `${distinctLevelsInYear.join(" / ")} · Year ${year}`;
    }
    return `Year ${year}`;
  }, [distinctLevelsInYear, year]);

  const monthSessions = useMemo(
    () => sessionsInMonth(year, month, clientSessions),
    [year, month, clientSessions],
  );
  const daySessions = useMemo(() => sessionsOn(day, clientSessions), [day, clientSessions]);

  const monthMatrix = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const prevMonth = () => {
    setMonth((m) => Math.max(0, m - 1));
  };

  const nextMonth = () => {
    setMonth((m) => Math.min(11, m + 1));
  };

  const shiftDay = (delta: number) => {
    setDay((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-navy py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-brand-red-foreground/80">Schedule &amp; Intakes</span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {displayYear} TRAINING CALENDAR
          </h1>
          <p className="mt-2 text-sm font-semibold tracking-wide text-brand-red-foreground/90 uppercase">
            {levelLabel}
          </p>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/75 sm:text-lg">
            Plan your certification path. View scheduled training and examination dates across all
            NDT Level 2 methods at our Masai, Johor centre.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            {/* Sidebar controls */}
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Calendar View
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
                {(["day", "month", "year"] as View[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={cn(
                      "cursor-pointer rounded-lg py-2 capitalize transition-colors",
                      view === v
                        ? "bg-background text-primary shadow-xs"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* View-specific picker */}
              <div className="mt-6 space-y-4">
                {view === "day" && (
                  <div>
                    <label
                      htmlFor="cal-day-select"
                      className="block text-xs font-semibold text-muted-foreground"
                    >
                      Select date
                    </label>
                    <input
                      id="cal-day-select"
                      type="date"
                      value={toISODate(day)}
                      min={`${year}-01-01`}
                      max={`${year}-12-31`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const parts = e.target.value.split("-").map(Number);
                          const y = parts[0];
                          const m = parts[1];
                          const d = parts[2];
                          if (y !== undefined && m !== undefined && d !== undefined) {
                            setYear(y);
                            setMonth(m - 1);
                            setDay(new Date(y, m - 1, d));
                          }
                        }
                      }}
                      className={cn(selectClass, "mt-1.5 w-full")}
                    />
                  </div>
                )}

                {view === "month" && (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="cal-month-select"
                        className="block text-xs font-semibold text-muted-foreground"
                      >
                        Month
                      </label>
                      <select
                        id="cal-month-select"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                        className={cn(selectClass, "mt-1.5 w-full")}
                      >
                        {MONTH_NAMES.map((name, i) => (
                          <option key={name} value={i}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="cal-month-year-select"
                        className="block text-xs font-semibold text-muted-foreground"
                      >
                        Year
                      </label>
                      <select
                        id="cal-month-year-select"
                        value={year}
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value, 10);
                          setYear(newYear);
                          setDay(new Date(newYear, month, 1));
                        }}
                        className={cn(selectClass, "mt-1.5 w-full")}
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {view === "year" && (
                  <div>
                    <label
                      htmlFor="cal-year-select"
                      className="block text-xs font-semibold text-muted-foreground"
                    >
                      Year
                    </label>
                    <select
                      id="cal-year-select"
                      value={year}
                      onChange={(e) => {
                        const newYear = parseInt(e.target.value, 10);
                        setYear(newYear);
                        setDay(new Date(newYear, month, 1));
                      }}
                      className={cn(selectClass, "mt-1.5 w-full")}
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Course codes legend */}
              <div className="mt-6 border-t border-border pt-5">
                <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Offered Methods
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {courses.map((c) => (
                    <li key={c.code} className="flex items-center justify-between">
                      <span className="font-bold text-primary">{c.code}</span>
                      <span className="truncate pl-2 text-right">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
                <p className="flex items-center gap-2 text-primary/80">
                  <span className="inline-block size-3 rounded-sm bg-navy" /> Training (
                  {TRAINING_TIME})
                </p>
                <p className="flex items-center gap-2 text-primary/80">
                  <span className="inline-block size-3 rounded-sm bg-brand-red" /> Examination (
                  {EXAM_TIME})
                </p>
              </div>

              <Button variant="cta" className="mt-6 w-full text-base" asChild>
                <Link href="/contact">Reserve a Seat</Link>
              </Button>
              {contactInfo.phoneHref && contactInfo.phoneDisplay ? (
                <a
                  href={`tel:${contactInfo.phoneHref}`}
                  className="mt-3 flex items-center justify-center gap-2 text-sm text-primary/70 transition-colors hover:text-brand-red"
                >
                  <Phone className="size-4" /> {contactInfo.phoneDisplay}
                </a>
              ) : null}
            </aside>

            {/* Calendar panel */}
            <div>
              {clientSessions.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                  <CalendarDays className="mx-auto mb-4 size-10 text-muted-foreground/50" />
                  <h3 className="font-display text-lg font-bold text-primary">
                    No Scheduled Sessions
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No sessions are scheduled yet. Contact us to plan your course.
                  </p>
                  <Button variant="cta" className="mt-6" asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                      <CalendarDays className="size-5 text-brand-red" />
                      {view === "day" && "Day View"}
                      {view === "month" && "Month View"}
                      {view === "year" && "Year View"}
                    </p>

                    {view === "day" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => shiftDay(-1)}
                          className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                          aria-label="Previous day"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-sm font-semibold text-primary">
                          {day.getDate()} {MONTH_NAMES[day.getMonth()]} {day.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => shiftDay(1)}
                          className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                          aria-label="Next day"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}

                    {view === "month" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={prevMonth}
                          disabled={month === 0}
                          className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-sm font-semibold text-primary">
                          {MONTH_NAMES[month]} {year}
                        </span>
                        <button
                          type="button"
                          onClick={nextMonth}
                          disabled={month === 11}
                          className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Next month"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Day view */}
                  {view === "day" && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <div className="border-b border-border pb-4">
                        <p className="font-display text-2xl font-bold text-primary">
                          {WEEKDAYS[day.getDay()]}, {day.getDate()} {MONTH_NAMES[day.getMonth()]}{" "}
                          {day.getFullYear()}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {daySessions.length === 0
                            ? "No sessions scheduled on this date."
                            : `${daySessions.length} session${daySessions.length > 1 ? "s" : ""} scheduled.`}
                        </p>
                      </div>

                      {daySessions.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                          <CalendarDays className="mx-auto mb-3 size-8 opacity-40" />
                          No training or examinations on this day.
                        </div>
                      ) : (
                        <div className="mt-5 space-y-3">
                          {daySessions.map((s, idx) => (
                            <SessionBadge key={`${s.courseCode}-${s.kind}-${idx}`} session={s} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Month view */}
                  {view === "month" && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-2 pb-3 text-center text-xs font-bold text-muted-foreground uppercase">
                        {WEEKDAYS.map((w) => (
                          <div key={w}>{w}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-2">
                        {monthMatrix.map((d, i) => {
                          if (d === null) {
                            return (
                              <div key={`empty-${i}`} className="min-h-20 rounded-xl bg-muted/30" />
                            );
                          }
                          const cellDate = new Date(year, month, d);
                          const s = sessionsOn(cellDate, clientSessions);
                          const hasTraining = s.some((x) => x.kind === "training");
                          const hasExam = s.some((x) => x.kind === "exam");

                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setDay(cellDate);
                                setView("day");
                              }}
                              className={cn(
                                "group flex min-h-20 cursor-pointer flex-col justify-between rounded-xl border border-border/60 p-2 text-left transition-colors hover:border-brand-red hover:bg-muted/40",
                                s.length > 0 && "bg-secondary/30",
                              )}
                            >
                              <span className="text-xs font-bold text-primary group-hover:text-brand-red">
                                {d}
                              </span>
                              <div className="space-y-1">
                                {hasTraining && (
                                  <span className="block h-1.5 w-full rounded-full bg-navy" />
                                )}
                                {hasExam && (
                                  <span className="block h-1.5 w-full rounded-full bg-brand-red" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Upcoming list in this month */}
                      <div className="mt-8 border-t border-border pt-6">
                        <h3 className="font-display text-sm font-bold text-primary">
                          All Sessions in {MONTH_NAMES[month]} {year} ({monthSessions.length})
                        </h3>
                        {monthSessions.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            No sessions scheduled for this month.
                          </p>
                        ) : (
                          <div className="mt-4 space-y-2">
                            {monthSessions.map((s, idx) => (
                              <SessionBadge key={`${s.courseCode}-${s.kind}-${idx}`} session={s} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Year view */}
                  {view === "year" && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {MONTH_NAMES.map((name, mIdx) => {
                          const count = sessionsInMonth(year, mIdx, clientSessions).length;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setMonth(mIdx);
                                setView("month");
                              }}
                              className="cursor-pointer rounded-xl border border-border p-4 text-left transition-colors hover:border-brand-red hover:bg-muted/40"
                            >
                              <p className="font-display text-base font-bold text-primary">
                                {name}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">{year}</p>
                              <div className="mt-3">
                                {count > 0 ? (
                                  <span className="inline-block rounded-md bg-navy px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                    {count} session{count > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Click a month to see its full date grid.
                      </p>
                    </div>
                  )}

                  <p className="mt-6 text-sm text-muted-foreground">
                    Dates are indicative and may shift with examination body scheduling. In-house
                    cohorts can be arranged outside this calendar.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
