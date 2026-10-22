import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Phone,
  ClipboardCheck,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calendarCourses, calendar2026Level2 } from "@/data/calendar";
import { contactInfo } from "@/data/site";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "2026 Training Calendar | Altair Academy" },
      {
        name: "description",
        content:
          "Altair Academy 2026 NDT Level 2 training and examination calendar for UT, MT, PT, PAUT, TOFD and RI courses.",
      },
      { property: "og:title", content: "2026 Training Calendar | Altair Academy" },
      {
        property: "og:description",
        content: "Month-by-month NDT Level 2 training and examination dates at Altair Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

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

function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<View>("month");
  const [day, setDay] = useState<Date>(new Date(DATA_YEAR, today.getMonth(), today.getDate()));
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(DATA_YEAR);

  const daySessions = useMemo(() => sessionsOn(day), [day]);
  const monthSessions = useMemo(() => sessionsInMonth(DATA_YEAR, month), [month]);

  const monthCells = useMemo(() => {
    const first = new Date(DATA_YEAR, month, 1);
    const daysInMonth = new Date(DATA_YEAR, month + 1, 0).getDate();
    const cells: ({ date: Date; sessions: Session[] } | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(DATA_YEAR, month, d);
      cells.push({ date, sessions: sessionsOn(date) });
    }
    return cells;
  }, [month]);

  const shiftMonth = (delta: number) => {
    setMonth((m) => {
      const next = m + delta;
      return next < 0 ? 0 : next > 11 ? 11 : next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="eyebrow text-brand-red-foreground/80">Schedule</span>
            <h1 className="mt-3 font-display text-4xl font-bold text-primary-foreground">
              2026 TRAINING CALENDAR
            </h1>
            <p className="mt-3 max-w-2xl text-primary-foreground/75">
              Browse training &amp; examination dates by day, month or year. Seats are limited per
              intake — confirm your place early.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Sidebar */}
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-6">
              <p className="font-display text-lg font-bold text-primary">View Calendar By</p>
              <div className="mt-4 flex flex-col gap-1">
                {(
                  [
                    { key: "day", label: "Day", hint: "Times & sessions" },
                    { key: "month", label: "Month", hint: "Dates with courses" },
                    { key: "year", label: "Year", hint: "Courses per month" },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      view === v.key
                        ? "bg-brand-red text-brand-red-foreground"
                        : "text-primary/80 hover:bg-secondary",
                    )}
                  >
                    <span className="font-semibold">{v.label}</span>
                    <span
                      className={cn(
                        "ml-2 text-xs",
                        view === v.key ? "text-brand-red-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {v.hint}
                    </span>
                  </button>
                ))}
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
                <Link to="/contact">Reserve a Seat</Link>
              </Button>
              <a
                href={`tel:${contactInfo.phoneHref}`}
                className="mt-3 flex items-center justify-center gap-2 text-sm text-primary/70 transition-colors hover:text-brand-red"
              >
                <Phone className="size-4" /> {contactInfo.phoneDisplay}
              </a>
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
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Level 2 · Year 2026
                </span>
              </div>

              {/* DAY VIEW */}
              {view === "day" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <label className="text-sm font-medium text-primary" htmlFor="day-picker">
                    Select a day
                  </label>
                  <input
                    id="day-picker"
                    type="date"
                    value={toISODate(day)}
                    min={`${DATA_YEAR}-01-01`}
                    max={`${DATA_YEAR}-12-31`}
                    onChange={(e) => {
                      const parsed = new Date(`${e.target.value}T00:00:00`);
                      if (e.target.value && !Number.isNaN(parsed.getTime())) setDay(parsed);
                    }}
                    className={cn(selectClass, "mt-2 w-full sm:w-auto")}
                  />

                  <p className="mt-6 font-display text-lg font-bold text-primary">
                    {day.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-4 space-y-3">
                    {daySessions.length > 0 ? (
                      daySessions.map((s, i) => <SessionBadge key={i} session={s} />)
                    ) : (
                      <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                        No training or examination sessions on this day. Try another date or switch
                        to Month view.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* MONTH VIEW */}
              {view === "month" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => shiftMonth(-1)}
                        disabled={month === 0}
                        className="cursor-pointer rounded-lg border border-border p-2 text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <select
                        aria-label="Select month"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className={selectClass}
                      >
                        {MONTH_NAMES.map((name, i) => (
                          <option key={name} value={i}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => shiftMonth(1)}
                        disabled={month === 11}
                        className="cursor-pointer rounded-lg border border-border p-2 text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                    <select
                      aria-label="Select year"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className={selectClass}
                    >
                      <option value={DATA_YEAR}>{DATA_YEAR}</option>
                    </select>
                  </div>

                  {/* Weekday header */}
                  <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="py-2">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthCells.map((cell, i) =>
                      cell === null ? (
                        <div key={`empty-${i}`} className="min-h-14 rounded-lg" />
                      ) : (
                        <button
                          key={cell.date.getDate()}
                          type="button"
                          onClick={() => {
                            setDay(cell.date);
                            setView("day");
                          }}
                          className={cn(
                            "flex min-h-14 cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent p-1 text-sm transition-colors",
                            cell.sessions.length > 0
                              ? "bg-secondary/70 font-semibold text-primary hover:border-brand-red"
                              : "text-muted-foreground hover:bg-secondary/50",
                          )}
                        >
                          <span>{cell.date.getDate()}</span>
                          {cell.sessions.length > 0 && (
                            <span className="flex gap-1">
                              {cell.sessions.some((s) => s.kind === "training") && (
                                <span className="size-1.5 rounded-full bg-navy" />
                              )}
                              {cell.sessions.some((s) => s.kind === "exam") && (
                                <span className="size-1.5 rounded-full bg-brand-red" />
                              )}
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Click any date to see session times for that day.
                  </p>

                  {/* Courses this month */}
                  <p className="mt-6 font-display text-lg font-bold text-primary">
                    Courses in {MONTH_NAMES[month]} {DATA_YEAR}
                  </p>
                  <div className="mt-4 space-y-3">
                    {monthSessions.length > 0 ? (
                      monthSessions.map((s, i) => <SessionBadge key={i} session={s} />)
                    ) : (
                      <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                        No sessions scheduled this month.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* YEAR VIEW */}
              {view === "year" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-bold text-primary">Select a year</p>
                    <select
                      aria-label="Select year"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className={selectClass}
                    >
                      <option value={DATA_YEAR}>{DATA_YEAR}</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {MONTH_NAMES.map((name, i) => {
                      const sessions = sessionsInMonth(year, i);
                      const codes = [...new Set(sessions.map((s) => s.courseCode))];
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            if (year === DATA_YEAR) {
                              setMonth(i);
                              setView("month");
                            }
                          }}
                          className={cn(
                            "cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-lg",
                            sessions.length === 0 && "opacity-60",
                          )}
                        >
                          <div className="flex items-baseline justify-between">
                            <p className="font-display font-bold text-primary">{name}</p>
                            <span className="text-xs text-muted-foreground">
                              {codes.length ? `${codes.length} course${codes.length > 1 ? "s" : ""}` : "No intake"}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {codes.length > 0 ? (
                              codes.map((code) => (
                                <span
                                  key={code}
                                  className="rounded-md bg-navy px-2 py-1 text-xs font-medium text-primary-foreground"
                                >
                                  {code}
                                </span>
                              ))
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
