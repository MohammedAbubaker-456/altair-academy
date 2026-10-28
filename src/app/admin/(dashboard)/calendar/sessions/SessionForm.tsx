/**
 * Calendar Session Create & Edit Form Component
 *
 * Client Component for administering training and exam sessions with react-hook-form,
 * zodResolver, live date span validation, duplicate warning, and auto-end date.
 *
 * Location: src/app/admin/(dashboard)/calendar/sessions/SessionForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import {
  calendarSessionSchema,
  isValidCalendarDate,
  getDaysSpan,
  type CalendarSessionInput,
} from "@/lib/validation/calendar";
import { formatDateOnlyRange } from "@/lib/date";
import { createSessionAction, updateSessionAction } from "@/app/admin/calendar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SessionKind, Status } from "@prisma/client";

export interface SessionInitialData {
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
}

export interface ExistingSessionLight {
  id: string;
  courseId: string;
  kind: SessionKind;
  startDate: string;
  endDate: string;
}

interface SessionFormProps {
  initialData?: SessionInitialData | null;
  prefilledData?: Partial<CalendarSessionInput> | null;
  courses: Array<{ id: string; code: string; name: string; status: Status }>;
  existingSessions?: ExistingSessionLight[];
}

export function SessionForm({
  initialData,
  prefilledData,
  courses,
  existingSessions = [],
}: SessionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingAndAdding, setIsSavingAndAdding] = React.useState(false);

  // Derive initial values
  const defaultValues: CalendarSessionInput = {
    courseId: initialData?.courseId ?? prefilledData?.courseId ?? courses[0]?.id ?? "",
    kind: initialData?.kind ?? prefilledData?.kind ?? "TRAINING",
    level: initialData?.level ?? prefilledData?.level ?? "Level 2",
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
    timeLabel: initialData?.timeLabel ?? prefilledData?.timeLabel ?? "",
    location: initialData?.location ?? prefilledData?.location ?? "",
    note: initialData?.note ?? prefilledData?.note ?? "",
    status: initialData?.status ?? prefilledData?.status ?? "ACTIVE",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CalendarSessionInput>({
    resolver: zodResolver(calendarSessionSchema),
    defaultValues,
  });

  const watchedCourseId = watch("courseId");
  const watchedKind = watch("kind");
  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedNote = watch("note") || "";

  // Time label placeholder dependent on kind
  const defaultTimeLabel = watchedKind === "TRAINING" ? "09:00 – 17:00 SST" : "09:00 – 13:00 SST";

  // Auto-fill end date when start date is chosen and end date is empty
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("startDate", val, { shouldValidate: true });
    const currentEnd = getValues("endDate");
    if (!currentEnd) {
      setValue("endDate", val, { shouldValidate: true });
    }
  };

  // Smart overlap check (warns without blocking)
  const overlappingSession = React.useMemo(() => {
    if (!watchedCourseId || !watchedKind || !watchedStartDate || !watchedEndDate) return null;
    if (!isValidCalendarDate(watchedStartDate) || !isValidCalendarDate(watchedEndDate)) return null;
    if (watchedEndDate < watchedStartDate) return null;

    return existingSessions.find((s) => {
      if (initialData && s.id === initialData.id) return false;
      if (s.courseId !== watchedCourseId || s.kind !== watchedKind) return false;
      return s.startDate <= watchedEndDate && s.endDate >= watchedStartDate;
    });
  }, [
    watchedCourseId,
    watchedKind,
    watchedStartDate,
    watchedEndDate,
    existingSessions,
    initialData,
  ]);

  // Compute day span
  const currentSpan = React.useMemo(() => {
    if (
      isValidCalendarDate(watchedStartDate) &&
      isValidCalendarDate(watchedEndDate) &&
      watchedEndDate >= watchedStartDate
    ) {
      return getDaysSpan(watchedStartDate, watchedEndDate);
    }
    return null;
  }, [watchedStartDate, watchedEndDate]);

  const submitForm = async (values: CalendarSessionInput, addAnother = false) => {
    if (addAnother) {
      setIsSavingAndAdding(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      if (initialData) {
        const result = await updateSessionAction(initialData.id, values);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/calendar?tab=sessions");
          router.refresh();
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
              if (msgs && msgs[0]) {
                setError(field as keyof CalendarSessionInput, { message: msgs[0] });
              }
            });
          }
          handleAdminActionResult(result);
        }
      } else {
        const result = await createSessionAction(values);
        if (result.ok) {
          toast.success(result.message);
          if (addAnother) {
            const keptCourse = values.courseId;
            const keptKind = values.kind;
            const keptLevel = values.level;
            reset({
              courseId: keptCourse,
              kind: keptKind,
              level: keptLevel ?? "Level 2",
              startDate: "",
              endDate: "",
              timeLabel: "",
              location: "",
              note: "",
              status: "ACTIVE",
            });
            router.refresh();
          } else {
            router.push("/admin/calendar?tab=sessions");
            router.refresh();
          }
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
              if (msgs && msgs[0]) {
                setError(field as keyof CalendarSessionInput, { message: msgs[0] });
              }
            });
          }
          handleAdminActionResult(result);
        }
      }
    } catch (err) {
      console.error("[SessionForm] Submit error:", err);
      toast.error("Failed to save calendar session.");
    } finally {
      setIsSubmitting(false);
      setIsSavingAndAdding(false);
    }
  };

  const isPending = isSubmitting || isSavingAndAdding;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 text-xs">
          <Link href="/admin/calendar?tab=sessions">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Calendar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
          {initialData ? "Edit Scheduled Session" : "Schedule New Session"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {initialData
            ? "Modify intake details, dates, or status for this calendar session."
            : "Add a training or examination intake to the public calendar schedule."}
        </p>
      </div>

      {/* Overlapping warning banner (non-blocking) */}
      {overlappingSession && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">Overlapping Session Detected:</span> Another{" "}
            <strong>{overlappingSession.kind === "TRAINING" ? "Training" : "Exam"}</strong> session
            is already scheduled for this course between{" "}
            <strong>
              {formatDateOnlyRange(overlappingSession.startDate, overlappingSession.endDate)}
            </strong>
            . You may still proceed if this is an intentional concurrent cohort.
          </div>
        </div>
      )}

      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-display">Session Details</CardTitle>
          <CardDescription className="text-xs">
            Course method, intake dates, timetable, and venue information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => submitForm(data, false))} className="space-y-6">
            {/* Row 1: Course & Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Course */}
              <div className="space-y-1.5">
                <Label htmlFor="courseId" className="text-xs font-semibold">
                  Course Method <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <SelectTrigger id="courseId" className="text-xs">
                        <SelectValue placeholder="Select course code" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="font-mono font-bold mr-2">{c.code}</span>
                            <span>{c.name}</span>
                            {c.status === "INACTIVE" && (
                              <span className="ml-2 text-muted-foreground text-[10px]">
                                (Inactive)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.courseId && (
                  <p className="text-xs text-destructive">{errors.courseId.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label htmlFor="kind" className="text-xs font-semibold">
                  Session Type <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <SelectTrigger id="kind" className="text-xs">
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRAINING">Training Session</SelectItem>
                        <SelectItem value="EXAM">Examination Session</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.kind && <p className="text-xs text-destructive">{errors.kind.message}</p>}
              </div>
            </div>

            {/* Row 2: Level */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="level" className="text-xs font-semibold">
                  Certification Level (Optional)
                </Label>
                <button
                  type="button"
                  onClick={() => setValue("level", "Level 2", { shouldValidate: true })}
                  className="text-[11px] text-navy hover:underline font-medium cursor-pointer"
                >
                  Suggest &ldquo;Level 2&rdquo;
                </button>
              </div>
              <Input
                id="level"
                placeholder="e.g. Level 2, Level 1"
                {...register("level")}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Display badge tag on public calendar (max 40 chars). Leave blank if not applicable.
              </p>
              {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
            </div>

            {/* Row 3: Start Date & End Date (Native date inputs, YYYY-MM-DD strings) */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Start Date */}
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-semibold">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <input
                  id="startDate"
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  value={watchedStartDate}
                  onChange={handleStartDateChange}
                  disabled={isPending}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  YYYY-MM-DD calendar date (stored without timezone conversion).
                </p>
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="endDate" className="text-xs font-semibold">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  {watchedStartDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setValue("endDate", watchedStartDate, { shouldValidate: true })
                      }
                      className="text-[11px] text-navy hover:underline font-medium cursor-pointer"
                    >
                      Single Day (End = Start)
                    </button>
                  )}
                </div>
                <input
                  id="endDate"
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  {...register("endDate")}
                  disabled={isPending}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {currentSpan !== null && (
                  <p className="text-[11px] text-muted-foreground">
                    Span:{" "}
                    <span className="font-semibold text-foreground">
                      {currentSpan} day{currentSpan === 1 ? "" : "s"}
                    </span>{" "}
                    (max 31 days).
                  </p>
                )}
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Row 4: Time Label & Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Time Label */}
              <div className="space-y-1.5">
                <Label htmlFor="timeLabel" className="text-xs font-semibold">
                  Time Label (Optional Override)
                </Label>
                <Input
                  id="timeLabel"
                  placeholder={`Default: ${defaultTimeLabel}`}
                  {...register("timeLabel")}
                  disabled={isPending}
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave blank to use the standard {defaultTimeLabel}.
                </p>
                {errors.timeLabel && (
                  <p className="text-xs text-destructive">{errors.timeLabel.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold">
                  Location (Optional)
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Masai, Johor centre"
                  {...register("location")}
                  disabled={isPending}
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Max 120 chars. Rendered on badge when present.
                </p>
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Row 5: Note */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="note" className="text-xs font-semibold">
                  Note / Special Instructions (Optional)
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {watchedNote.length} / 300
                </span>
              </div>
              <Textarea
                id="note"
                placeholder="e.g. PCN exam candidate briefing scheduled at 08:30"
                rows={2}
                {...register("note")}
                disabled={isPending}
                className="text-xs"
              />
              {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
            </div>

            {/* Row 6: Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">
                Publication Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger id="status" className="w-48 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE (Published)</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isPending}
                className="text-xs"
              >
                <Link href="/admin/calendar?tab=sessions">Cancel</Link>
              </Button>

              <div className="flex items-center gap-2">
                {!initialData && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleSubmit((data) => submitForm(data, true))}
                    className="text-xs"
                  >
                    {isSavingAndAdding ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save & Add Another"
                    )}
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-navy hover:bg-navy/90 text-primary-foreground text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving Session...
                    </>
                  ) : initialData ? (
                    "Save Changes"
                  ) : (
                    "Save Session"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
