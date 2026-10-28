/**
 * Admin Calendar Sessions Management Tab
 *
 * Renders the session schedule table with multi-filter controls (year, month,
 * course, type, status, upcoming-only, keyword search), pagination,
 * optimistic status switch, duplication, and deletion.
 *
 * Location: src/app/admin/(dashboard)/calendar/CalendarSessionsTab.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { formatDateOnlyRange } from "@/lib/date";
import {
  setSessionStatusAction,
  deleteSessionAction,
} from "@/app/admin/calendar/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";
import type { SessionKind, Status } from "@prisma/client";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const DEFAULT_TRAINING_TIME = "09:00 – 17:00 SST";
const DEFAULT_EXAM_TIME = "09:00 – 13:00 SST";

export interface SessionTableRow {
  id: string;
  courseId: string;
  kind: SessionKind;
  level: string | null;
  startDate: string;
  endDate: string;
  timeLabel: string | null;
  location: string | null;
  note: string | null;
  status: Status;
  course: {
    id: string;
    code: string;
    name: string;
    order: number;
    status: Status;
  };
}

interface CalendarSessionsTabProps {
  items: SessionTableRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableYears: number[];
  defaultYear: number | "ALL";
  courses: Array<{ id: string; code: string; name: string }>;
}

export function CalendarSessionsTab({
  items,
  total,
  page,
  pageSize,
  totalPages,
  availableYears,
  defaultYear,
  courses,
}: CalendarSessionsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL search params state
  const selectedYear = searchParams.get("year") ?? (defaultYear !== "ALL" ? String(defaultYear) : "ALL");
  const selectedMonth = searchParams.get("month") ?? "ALL";
  const selectedCourse = searchParams.get("course") ?? "ALL";
  const selectedType = searchParams.get("type") ?? "ALL";
  const selectedStatus = searchParams.get("status") ?? "ALL";
  const isUpcomingOnly = searchParams.get("upcoming") === "true";
  const searchQ = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = React.useState(searchQ);

  const applyFilters = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Preserve active tab
    params.set("tab", "sessions");

    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "ALL" || val === "false") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset page to 1 unless page itself was updated
    if (!updates["page"]) {
      params.delete("page");
    }

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: searchTerm.trim() || null });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    params.set("tab", "sessions");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSessionAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[CalendarSessionsTab] Delete error:", err);
      toast.error("Failed to delete session.");
    }
  };

  const hasActiveFilters =
    (selectedYear !== "ALL" && selectedYear !== String(defaultYear)) ||
    selectedMonth !== "ALL" ||
    selectedCourse !== "ALL" ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL" ||
    isUpcomingOnly ||
    Boolean(searchQ);

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
            Scheduled Sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage training intakes and exam sessions. ({total} total found)
          </p>
        </div>
        <Button asChild className="bg-navy hover:bg-navy/90 text-primary-foreground shrink-0">
          <Link href="/admin/calendar/sessions/new">
            <Plus className="mr-2 h-4 w-4" /> Add Session
          </Link>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        {/* Row 1: Search & Dropdowns */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search location or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </form>

          {/* Year Filter */}
          <Select
            value={selectedYear}
            onValueChange={(val) => applyFilters({ year: val })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Years</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} {defaultYear === y ? "(Default)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month Filter */}
          <Select
            value={selectedMonth}
            onValueChange={(val) => applyFilters({ month: val })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course Filter */}
          <Select
            value={selectedCourse}
            onValueChange={(val) => applyFilters({ course: val })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Course Code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} – {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Session Type Filter */}
          <Select
            value={selectedType}
            onValueChange={(val) => applyFilters({ type: val })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="TRAINING">Training</SelectItem>
              <SelectItem value="EXAM">Examination</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Status, Upcoming-only & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">Status:</span>
              <Select
                value={selectedStatus}
                onValueChange={(val) => applyFilters({ status: val })}
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upcoming Only Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer font-medium select-none text-foreground">
              <Checkbox
                checked={isUpcomingOnly}
                onCheckedChange={(checked) =>
                  applyFilters({ upcoming: checked ? "true" : null })
                }
              />
              <span>Upcoming sessions only (MYT)</span>
            </label>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-48 font-semibold">Course</TableHead>
              <TableHead className="w-28 font-semibold">Type</TableHead>
              <TableHead className="w-44 font-semibold">Scheduled Dates</TableHead>
              <TableHead className="w-40 font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Location / Notes</TableHead>
              <TableHead className="w-36 font-semibold">Status</TableHead>
              <TableHead className="w-28 text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium text-sm">No scheduled sessions found.</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search criteria or add a new calendar session.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
                      <Link href="/admin/calendar/sessions/new">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add New Session
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((session) => {
                const isTraining = session.kind === "TRAINING";
                const dateLabel = formatDateOnlyRange(session.startDate, session.endDate);
                const timeText =
                  session.timeLabel?.trim() ||
                  (isTraining ? DEFAULT_TRAINING_TIME : DEFAULT_EXAM_TIME);

                return (
                  <TableRow key={session.id} className="hover:bg-muted/30">
                    {/* Course */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-navy/10 text-navy px-1.5 py-0.5 rounded">
                          {session.course.code}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-xs truncate">
                            {session.course.name}
                          </p>
                          {session.level && (
                            <p className="text-[11px] text-muted-foreground">{session.level}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${
                          isTraining ? "bg-navy" : "bg-brand-red"
                        }`}
                      >
                        {isTraining ? (
                          <GraduationCap className="h-3 w-3" />
                        ) : (
                          <ClipboardCheck className="h-3 w-3" />
                        )}
                        {isTraining ? "Training" : "Exam"}
                      </span>
                    </TableCell>

                    {/* Dates */}
                    <TableCell className="font-medium text-xs text-foreground whitespace-nowrap">
                      {dateLabel}
                    </TableCell>

                    {/* Time */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeText}
                    </TableCell>

                    {/* Location & Note */}
                    <TableCell className="text-xs">
                      {session.location ? (
                        <p className="font-medium text-foreground">{session.location}</p>
                      ) : null}
                      {session.note ? (
                        <p className="text-muted-foreground line-clamp-1 italic">{session.note}</p>
                      ) : null}
                      {!session.location && !session.note && (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell>
                      <StatusSwitch
                        id={session.id}
                        initialStatus={session.status}
                        onToggle={setSessionStatusAction}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Session"
                        >
                          <Link href={`/admin/calendar/sessions/${session.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>

                        {/* Duplicate */}
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Duplicate Session"
                        >
                          <Link href={`/admin/calendar/sessions/new?duplicateFrom=${session.id}`}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate</span>
                          </Link>
                        </Button>

                        {/* Delete */}
                        <DeleteDialog
                          title="Delete Scheduled Session?"
                          description={`Delete ${session.course.code} ${isTraining ? "Training" : "Exam"} (${dateLabel})? This cannot be undone.`}
                          onConfirm={() => handleDelete(session.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete Session"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * pageSize, total)}</span> of{" "}
              <span className="font-medium">{total}</span> sessions
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => applyFilters({ page: String(page - 1) })}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => applyFilters({ page: String(page + 1) })}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
