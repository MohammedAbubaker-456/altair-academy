/**
 * Calendar Course Code Create & Edit Modal Dialog
 *
 * Provides dialog form for adding and modifying calendar course codes
 * with order management and status selection.
 *
 * Location: src/app/admin/(dashboard)/calendar/CourseCodeDialog.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import {
  calendarCourseSchema,
  type CalendarCourseInput,
} from "@/lib/validation/calendar";
import {
  createCourseAction,
  updateCourseAction,
} from "@/app/admin/calendar/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface CourseCodeData {
  id: string;
  code: string;
  name: string;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface CourseCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseCodeData | null;
  defaultOrder?: number;
}

export function CourseCodeDialog({
  open,
  onOpenChange,
  course,
  defaultOrder = 0,
}: CourseCodeDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<CalendarCourseInput>({
    resolver: zodResolver(calendarCourseSchema),
    defaultValues: {
      code: "",
      name: "",
      order: defaultOrder,
      status: "ACTIVE",
    },
  });

  // Reset values when course or dialog open state changes
  React.useEffect(() => {
    if (open) {
      if (course) {
        reset({
          code: course.code,
          name: course.name,
          order: course.order,
          status: course.status,
        });
      } else {
        reset({
          code: "",
          name: "",
          order: defaultOrder,
          status: "ACTIVE",
        });
      }
    }
  }, [open, course, defaultOrder, reset]);

  const onSubmit = async (data: CalendarCourseInput) => {
    setIsSubmitting(true);
    try {
      if (course) {
        const result = await updateCourseAction(course.id, data);
        if (result.ok) {
          toast.success(result.message);
          onOpenChange(false);
          router.refresh();
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
              if (msgs && msgs[0]) {
                setError(field as keyof CalendarCourseInput, { message: msgs[0] });
              }
            });
          }
          handleAdminActionResult(result);
        }
      } else {
        const result = await createCourseAction(data);
        if (result.ok) {
          toast.success(result.message);
          onOpenChange(false);
          router.refresh();
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
              if (msgs && msgs[0]) {
                setError(field as keyof CalendarCourseInput, { message: msgs[0] });
              }
            });
          }
          handleAdminActionResult(result);
        }
      }
    } catch (err) {
      console.error("[CourseCodeDialog] Submit error:", err);
      toast.error("Failed to save course code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {course ? `Edit Course Code: ${course.code}` : "New Calendar Course Code"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {course
              ? "Update course code abbreviation, full title, and display sequence."
              : "Define a course code for the public training calendar and intake sessions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold">
              Course Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g. UT, PAUT, MT"
              {...register("code")}
              onChange={(e) => setValue("code", e.target.value.toUpperCase())}
              disabled={isSubmitting}
              className="uppercase font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              2–12 uppercase letters, numbers, or dashes (e.g. UT, TOFD, PAUT).
            </p>
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Full Course Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Ultrasonic Testing"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Order & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="order" className="text-xs font-semibold">
                Display Order
              </Label>
              <Input
                id="order"
                type="number"
                min={0}
                max={9999}
                {...register("order", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.order && (
                <p className="text-xs text-destructive">{errors.order.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">
                Status
              </Label>
              <Select
                defaultValue={course?.status ?? "ACTIVE"}
                onValueChange={(val: "ACTIVE" | "INACTIVE") => setValue("status", val)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-navy hover:bg-navy/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : course ? (
                "Save Changes"
              ) : (
                "Create Code"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
