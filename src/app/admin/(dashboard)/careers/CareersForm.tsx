/**
 * Careers / Job Opening Create & Edit Form Component
 *
 * Client Component for administering job openings with live character counter,
 * validation feedback, and server action submission.
 *
 * Location: src/app/admin/(dashboard)/careers/CareersForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { jobOpeningSchema, type JobOpeningInput } from "@/lib/validation/careers";
import { createJobOpeningAction, updateJobOpeningAction } from "@/app/admin/careers/actions";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/careers";
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
import { Loader2, ArrowLeft } from "lucide-react";
import type { EmploymentType, Status } from "@prisma/client";

interface JobOpeningInitialData {
  id: string;
  title: string;
  employmentType: EmploymentType;
  location: string;
  scope: string;
  summary: string;
  order: number;
  status: Status;
}

interface CareersFormProps {
  initialData?: JobOpeningInitialData | null;
}

export function CareersForm({ initialData }: CareersFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<JobOpeningInput>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      employmentType: initialData?.employmentType ?? "FULL_TIME",
      location: initialData?.location ?? "Masai, Johor",
      scope: initialData?.scope ?? "",
      summary: initialData?.summary ?? "",
      order: initialData?.order ?? 0,
      status: initialData?.status ?? "ACTIVE",
    },
  });

  const currentSummary = watch("summary") || "";

  const onSubmit = async (values: JobOpeningInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateJobOpeningAction(initialData.id, values);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/careers");
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createJobOpeningAction(values);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/careers");
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }
    } catch {
      toast.error("An unexpected error occurred while saving the job opening.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
          <Link href="/admin/careers">
            <ArrowLeft className="h-4 w-4" /> Back to Careers
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
          {initialData ? `Edit Opening: ${initialData.title}` : "Create Job Opening"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {initialData
            ? "Update role requirements, location, and display details."
            : "Publish a new position to the public careers page."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-display">Role Overview</CardTitle>
            <CardDescription>
              Basic information displayed in the role header and card title.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. NDT Level III Instructor"
                  maxLength={120}
                  {...register("title")}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label htmlFor="employmentType" className="text-sm font-medium">
                  Employment Type <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="employmentType" className="bg-card">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {EMPLOYMENT_TYPE_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.employmentType && (
                  <p className="text-xs text-destructive">{errors.employmentType.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Masai, Johor or Hybrid"
                  maxLength={120}
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Scope Tag */}
              <div className="space-y-2">
                <Label htmlFor="scope" className="text-sm font-medium">
                  Scope / Tag <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scope"
                  placeholder="e.g. UT / PAUT / TOFD or Examination body"
                  maxLength={120}
                  {...register("scope")}
                />
                <p className="text-[11px] text-muted-foreground">
                  Short badge representing methods, certifications or operational scope.
                </p>
                {errors.scope && <p className="text-xs text-destructive">{errors.scope.message}</p>}
              </div>
            </div>

            {/* Summary with Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary" className="text-sm font-medium">
                  Job Summary <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">
                  {currentSummary.length} / 600 chars
                </span>
              </div>
              <Textarea
                id="summary"
                rows={4}
                placeholder="Key duties, instructor commitments, or candidate requirements..."
                maxLength={600}
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-xs text-destructive">{errors.summary.message}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 border-t pt-6">
              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order" className="text-sm font-medium">
                  Sort Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  max={9999}
                  {...register("order", { valueAsNumber: true })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Lower numbers display first on the public careers page.
                </p>
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Publication Status
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="bg-card">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE (Published publicly)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Hidden)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" asChild disabled={isSubmitting}>
            <Link href="/admin/careers">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-navy hover:bg-navy/90 text-primary-foreground min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Publish Opening"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
