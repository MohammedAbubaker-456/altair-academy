/**
 * Upcoming Intakes Management Interactive Client View
 *
 * Provides paginated upcoming intakes table, timing tabs (Upcoming / Past / All),
 * status filter, keyword search, modal create/edit dialog with live points editor,
 * non-blocking warnings, live IntakeCard preview, optimistic status switch,
 * and deletion confirmation.
 *
 * Location: src/app/admin/(dashboard)/intakes/IntakesManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { formatIntakeDateRange } from "@/lib/date";
import {
  createIntake,
  updateIntake,
  deleteIntake,
  setIntakeStatus,
} from "@/app/admin/intakes/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { IntakeCard } from "@/components/site/IntakeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  Info,
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";
import type { Status } from "@prisma/client";
import type { IntakeTimingFilter } from "@/server/admin/intakes";

export interface IntakeRow {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  points: string[];
  order: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

interface IntakesManagerProps {
  items: IntakeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  today: string;
  currentTiming: IntakeTimingFilter;
}

export function IntakesManager({
  items,
  total,
  page,
  pageSize,
  totalPages,
  today,
  currentTiming,
}: IntakesManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = (searchParams.get("status") as Status | "ALL") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<IntakeRow | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [formTitle, setFormTitle] = React.useState("");
  const [formStartDate, setFormStartDate] = React.useState("");
  const [formEndDate, setFormEndDate] = React.useState("");
  const [formLocation, setFormLocation] = React.useState("");
  const [formPoints, setFormPoints] = React.useState<string[]>([]);
  const [formOrder, setFormOrder] = React.useState(0);
  const [formStatus, setFormStatus] = React.useState<Status>("ACTIVE");
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const applyFilters = (newQ: string, newTiming: string, newStatus: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newTiming && newTiming !== "UPCOMING") params.set("timing", newTiming);
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/intakes${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentTiming, currentStatus, 1);
  };

  const handleTimingChange = (timing: string) => {
    applyFilters(searchTerm, timing, currentStatus, 1);
  };

  const handleStatusFilterChange = (status: string) => {
    applyFilters(searchTerm, currentTiming, status, 1);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormStartDate("");
    setFormEndDate("");
    setFormLocation("Kuala Lumpur Centre");
    setFormPoints([""]);
    setFormOrder(total + 1);
    setFormStatus("ACTIVE");
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: IntakeRow) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormStartDate(item.startDate);
    setFormEndDate(item.endDate);
    setFormLocation(item.location);
    setFormPoints(item.points.length > 0 ? [...item.points] : [""]);
    setFormOrder(item.order);
    setFormStatus(item.status);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDuplicate = (item: IntakeRow) => {
    setEditingItem(null);
    setFormTitle(`${item.title}`);
    setFormStartDate("");
    setFormEndDate("");
    setFormLocation(item.location);
    setFormPoints(item.points.length > 0 ? [...item.points] : [""]);
    setFormOrder(total + 1);
    setFormStatus("ACTIVE");
    setFormErrors({});
    setDialogOpen(true);
    toast.info("Prefilled intake fields. Enter new dates to save.");
  };

  // Points handlers
  const handleAddPoint = () => {
    if (formPoints.length >= 5) return;
    setFormPoints((prev) => [...prev, ""]);
  };

  const handleRemovePoint = (index: number) => {
    setFormPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, val: string) => {
    setFormPoints((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleMovePoint = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= formPoints.length) return;
    setFormPoints((prev) => {
      const next = [...prev];
      const temp = next[index]!;
      next[index] = next[target]!;
      next[target] = temp;
      return next;
    });
  };

  // Date auto-sync: when startDate changes and endDate is empty or equal to previous start
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    if (!formEndDate || formEndDate === formStartDate) {
      setFormEndDate(newStart);
    }
    setFormStartDate(newStart);
  };

  // Non-blocking warnings
  const effectiveEndDate = formEndDate || formStartDate;
  const isPastWarning = effectiveEndDate && effectiveEndDate < today;
  const isDuplicateTitleWarning =
    formTitle.trim().length > 0 &&
    items.some(
      (item) =>
        item.title.toLowerCase().trim() === formTitle.toLowerCase().trim() &&
        item.id !== editingItem?.id,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      title: formTitle,
      startDate: formStartDate,
      endDate: formEndDate || formStartDate,
      location: formLocation,
      points: formPoints.filter((p) => p.trim().length > 0),
      order: Number(formOrder),
      status: formStatus,
    };

    try {
      if (editingItem) {
        const result = await updateIntake(editingItem.id, payload);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
        if (!result.ok && result.fieldErrors) {
          const flatErrors: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([k, v]) => {
            if (v && v.length > 0) flatErrors[k] = v[0]!;
          });
          setFormErrors(flatErrors);
        }
      } else {
        const result = await createIntake(payload);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
        if (!result.ok && result.fieldErrors) {
          const flatErrors: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([k, v]) => {
            if (v && v.length > 0) flatErrors[k] = v[0]!;
          });
          setFormErrors(flatErrors);
        }
      }
    } catch (err) {
      console.error("[IntakesManager] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteIntake(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[IntakesManager] Delete error:", err);
      toast.error("Failed to delete upcoming intake");
    }
  };

  // Timing badge helper
  const getTimingBadge = (start: string, end: string) => {
    if (end < today) {
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          Past
        </Badge>
      );
    }
    if (start <= today && end >= today) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
          Today
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
        Upcoming
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Top Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
              Upcoming Intakes
            </h1>
            <Badge variant="outline" className="text-xs">
              {total} {total === 1 ? "intake" : "intakes"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage scheduled training intakes displayed in the home page &quot;Training
            calendar&quot; section.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-navy hover:bg-navy/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Intake
        </Button>
      </div>

      {/* Distinction Info Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p>
            These cards appear in the <strong>&quot;Training calendar&quot;</strong> section on the
            home page. Past intakes are hidden there automatically based on the current date
            (Asia/Kuala_Lumpur).
          </p>
          <p className="text-blue-700">
            The full dedicated <code className="rounded bg-blue-100 px-1 py-0.5">/calendar</code>{" "}
            page with course codes and filtering is managed under{" "}
            <Link href="/admin/calendar" className="font-semibold underline hover:text-blue-950">
              Training calendar
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Timing Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleTimingChange("UPCOMING")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentTiming === "UPCOMING"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => handleTimingChange("PAST")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentTiming === "PAST"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past
            </button>
            <button
              type="button"
              onClick={() => handleTimingChange("ALL")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                currentTiming === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
          </div>

          {/* Status Filter */}
          <Select value={currentStatus} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {(currentQ || currentStatus !== "ALL" || currentTiming !== "UPCOMING") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                router.push("/admin/intakes");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </form>
      </div>

      {/* Intakes Table */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[100px]">Highlights</TableHead>
              <TableHead className="w-[100px]">Timing</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <CalendarDays className="h-9 w-9 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium">No upcoming intakes found</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
                      {currentQ || currentStatus !== "ALL" || currentTiming !== "UPCOMING"
                        ? "Try clearing filters or search terms."
                        : "Click 'Add Intake' to schedule your first upcoming course intake."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.order}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-foreground">
                      {formatIntakeDateRange(item.startDate, item.endDate)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {item.startDate}
                      {item.endDate && item.endDate !== item.startDate
                        ? ` \u2192 ${item.endDate}`
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {item.points.length} {item.points.length === 1 ? "point" : "points"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTimingBadge(item.startDate, item.endDate)}</TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={item.id}
                      initialStatus={item.status}
                      onToggle={setIntakeStatus}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit intake"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(item)}
                        title="Duplicate with blank dates"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Duplicate</span>
                      </Button>
                      <DeleteDialog
                        title="Delete Upcoming Intake"
                        description={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
                        onConfirm={() => handleDelete(item.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete intake"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total
            items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => applyFilters(currentQ, currentTiming, currentStatus, page - 1)}
              className="h-8 text-xs"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => applyFilters(currentQ, currentTiming, currentStatus, page + 1)}
              className="h-8 text-xs"
            >
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Dialog for Create / Edit / Duplicate */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingItem ? "Edit Upcoming Intake" : "Create Upcoming Intake"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure intake title, scheduled calendar dates, location, and highlight points.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] pt-2">
            {/* Form Left Column */}
            <form id="intake-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Warnings */}
              {isPastWarning && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Date Notice:</strong> This intake date is in the past (
                    {effectiveEndDate} &lt; {today}) and will not appear on the home page.
                  </div>
                </div>
              )}

              {isDuplicateTitleWarning && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>Notice:</strong> An intake with the title &quot;{formTitle}&quot;
                    already exists.
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formTitle.length}/120
                  </span>
                </div>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Visual Testing (VT) Level 1"
                  maxLength={120}
                  required
                  className="text-xs"
                />
                {formErrors["title"] && (
                  <p className="text-xs text-destructive">{formErrors["title"]}</p>
                )}
              </div>

              {/* Dates Row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-semibold">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formStartDate}
                    onChange={handleStartDateChange}
                    required
                    className="text-xs"
                  />
                  {formErrors["startDate"] && (
                    <p className="text-xs text-destructive">{formErrors["startDate"]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="endDate" className="text-xs font-semibold">
                      End Date
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Defaults to start date
                    </span>
                  </div>
                  <Input
                    id="endDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    min={formStartDate || undefined}
                    className="text-xs"
                  />
                  {formErrors["endDate"] && (
                    <p className="text-xs text-destructive">{formErrors["endDate"]}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-xs font-semibold">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formLocation.length}/120
                  </span>
                </div>
                <Input
                  id="location"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Kuala Lumpur Centre or Live online classroom"
                  maxLength={120}
                  required
                  className="text-xs"
                />
                {formErrors["location"] && (
                  <p className="text-xs text-destructive">{formErrors["location"]}</p>
                )}
              </div>

              {/* Order & Status */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="order" className="text-xs font-semibold">
                    Display Order
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    max={9999}
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 0)}
                    className="text-xs"
                  />
                  {formErrors["order"] && (
                    <p className="text-xs text-destructive">{formErrors["order"]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold">
                    Status
                  </Label>
                  <Select value={formStatus} onValueChange={(val: Status) => setFormStatus(val)}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE (Published)</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Highlights Points Editor */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">
                      Highlight Points ({formPoints.length}/5)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Bullet points displayed on the home page card (max 5 points, up to 100
                      characters each).
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPoint}
                    disabled={formPoints.length >= 5}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Point
                  </Button>
                </div>

                <div className="space-y-2">
                  {formPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="flex flex-col gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => handleMovePoint(index, -1)}
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === formPoints.length - 1}
                          onClick={() => handleMovePoint(index, 1)}
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="relative flex-1">
                        <Input
                          value={point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          placeholder={`Point ${index + 1} (e.g. 3-day intensive schedule)`}
                          maxLength={100}
                          className="text-xs pr-12"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-mono">
                          {point.length}/100
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePoint(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Remove point"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {formPoints.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-1">
                      No points added. Click &quot;Add Point&quot; above.
                    </p>
                  )}
                  {formErrors["points"] && (
                    <p className="text-xs text-destructive">{formErrors["points"]}</p>
                  )}
                </div>
              </div>
            </form>

            {/* Live Preview Right Column */}
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Live Home Page Preview
                </span>
                <span className="text-[11px] text-muted-foreground">Exact card rendering</span>
              </div>
              <div className="pt-2">
                <IntakeCard
                  intake={{
                    title: formTitle.trim() || "Visual Testing (VT) Level 1",
                    startDate: formStartDate || today,
                    endDate: formEndDate || formStartDate || today,
                    location: formLocation.trim() || "Kuala Lumpur Centre",
                    points:
                      formPoints.filter((p) => p.trim().length > 0).length > 0
                        ? formPoints.filter((p) => p.trim().length > 0)
                        : [
                            "3-day intensive schedule",
                            "Practical exam included",
                            "Seats limited to 12",
                          ],
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center pt-2">
                Matches the layout and typography rendered on the public home page.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="intake-form"
              disabled={isSubmitting}
              className="bg-navy hover:bg-navy/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editingItem ? (
                "Update Intake"
              ) : (
                "Create Intake"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
