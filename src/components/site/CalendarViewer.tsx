/**
 * Interactive Training Calendar Viewer Component
 *
 * Client Component rendering day, month, and year calendar views
 * with intake date navigation, course filtering, and reserve seat CTAs.
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
import { calendarCourses, calendar2026Level2 } from "@/data/calendar";
import type { LegacyContactInfo } from "@/server/queries/contact";

type View = "day" | "month" | "year";

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
const DATA_YEAR = 2026;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TRAINING_TIME = "09:00 – 17:00 SST";
const EXAM_TIME = "09:00 – 13:00 SST";

type Session = {
  courseCode: string;
  courseName: string;
  kind: "training" | "exam";
  start: Date;
  end: Date;
};

function parseRange(range: string, monthIdx: number): { start: Date; end: Date } {
  const [a, b] = range.split("-").map((n) => parseInt(n, 10));
  return {
    start: new Date(DATA_YEAR, monthIdx, a),
    end: new Date(DATA_YEAR, monthIdx, b ?? a),
  };
}

/** Flatten the 2026 calendar into dated sessions. */
function buildSessions(): Session[] {
  const sessions: Session[] = [];
  calendar2026Level2.forEach((entry) => {
    const monthIdx = MONTH_NAMES.indexOf(entry.month);
    Object.entries(entry.slots).forEach(([code, slot]) => {
      const course = calendarCourses.find((c) => c.code === code);
      if (!course) return;
      if (slot.training) {
        const { start, end } = parseRange(slot.training, monthIdx);
        sessions.push({ courseCode: code, courseName: course.name, kind: "training", start, end });
      }
      if (slot.exam) {
        const { start, end } = parseRange(slot.exam, monthIdx);
        sessions.push({ courseCode: code, courseName: course.name, kind: "exam", start, end });
      }
    });
  });
  return sessions.sort((a, b) => a.start.getTime() - b.start.getTime());
}

const ALL_SESSIONS = buildSessions();

function sessionsOn(date: Date): Session[] {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return ALL_SESSIONS.filter((s) => {
    const start = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()).getTime();
    const end = new Date(s.end.getFullYear(), s.end.getMonth(), s.end.getDate()).getTime();
    return d >= start && d <= end;
  });
}

function sessionsInMonth(year: number, monthIdx: number): Session[] {
  return ALL_SESSIONS.filter(
    (s) =>
      (s.start.getFullYear() === year && s.start.getMonth() === monthIdx) ||
      (s.end.getFullYear() === year && s.end.getMonth() === monthIdx),
  );
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SessionBadge({ session }: { session: Session }) {
  const training = session.kind === "training";
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl p-4",
        training ? "bg-navy text-primary-foreground" : "bg-brand-red text-brand-red-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        {training ? <GraduationCap className="size-5" /> : <ClipboardCheck className="size-5" />}
        <div>
          <p className="font-display text-sm font-bold">
            {session.courseCode}
            <span className="ml-2 text-xs font-normal opacity-80">{session.courseName}</span>
          </p>
          <p className="text-xs opacity-80">
            {training ? "Training" : "Examination"} · {session.start.getDate()}
            {session.start.getDate() !== session.end.getDate()
              ? `–${session.end.getDate()} ${MONTH_NAMES[session.start.getMonth()]}`
              : ` ${MONTH_NAMES[session.start.getMonth()]}`}{" "}
            {session.start.getFullYear()}
          </p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-medium">
        <Clock className="size-3.5" />
        {training ? TRAINING_TIME : EXAM_TIME}
      </p>
    </div>
  );
}

const selectClass =
  "cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-ring";

export function CalendarViewer({ contactInfo }: { contactInfo: LegacyContactInfo }) {
  const [view, setView] = useState<View>("month");
  const [day, setDay] = useState<Date>(() => new Date(DATA_YEAR, 0, 1));
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(DATA_YEAR);

  useEffect(() => {
    const today = new Date();
    setMonth(today.getMonth());
    setYear(DATA_YEAR);
    setDay(new Date(DATA_YEAR, today.getMonth(), today.getDate()));
  }, []);

  const monthSessions = useMemo(() => sessionsInMonth(year, month), [year, month]);
  const daySessions = useMemo(() => sessionsOn(day), [day]);

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
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => (m > 0 ? m - 1 : 0));
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => (m < 11 ? m + 1 : 11));
    }
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
            2026 TRAINING CALENDAR
          </h1>
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
                      min="2026-01-01"
                      max="2026-12-31"
                      onChange={(e) => {
                        if (e.target.value) {
                          const parts = e.target.value.split("-").map(Number);
                          const y = parts[0];
                          const m = parts[1];
                          const d = parts[2];
                          if (y !== undefined && m !== undefined && d !== undefined) {
                            setDay(new Date(y, m - 1, d));
                          }
                        }
                      }}
                      className={cn(selectClass, "mt-1.5 w-full")}
                    />
                  </div>
                )}

                {view === "month" && (
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
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                      className={cn(selectClass, "mt-1.5 w-full")}
                    >
                      <option value={2026}>2026</option>
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
                  {calendarCourses.map((c) => (
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
                      className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary"
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
                      className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-primary"
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
                      const s = sessionsOn(cellDate);
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
                      const count = sessionsInMonth(year, mIdx).length;
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
                          <p className="font-display text-base font-bold text-primary">{name}</p>
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
