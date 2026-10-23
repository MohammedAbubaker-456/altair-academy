/**
 * Course Create / Edit Form Component
 *
 * Full-featured interactive form for course content, image uploading to Cloudinary,
 * slug generation, and category relations.
 *
 * Location: src/app/admin/(dashboard)/courses/CourseForm.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@/lib/validation/course";
import { slugify } from "@/lib/slugify";
import { createCourseAction, updateCourseAction } from "@/app/admin/courses/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface CourseInitialData {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  level: string | null;
  duration: string;
  price: string;
  summary: string;
  image: string | null;
  isFeatured: boolean;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface CourseFormProps {
  initialData?: CourseInitialData | null;
  categories: CategoryOption[];
}

export function CourseForm({ initialData, categories }: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      categoryId: initialData?.categoryId ?? (categories[0]?.id || ""),
      level: initialData?.level ?? null,
      duration: initialData?.duration ?? "",
      price: initialData?.price ?? "",
      summary: initialData?.summary ?? "",
      image: initialData?.image ?? null,
      isFeatured: initialData?.isFeatured ?? false,
      order: initialData?.order ?? 0,
      status: initialData?.status ?? "ACTIVE",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value, { shouldValidate: true });
    if (!initialData) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CourseInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateCourseAction(initialData.id, data);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/courses");
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createCourseAction(data);
        if (result.ok) {
          toast.success(result.message);
          router.push("/admin/courses");
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            {initialData ? `Edit Course: ${initialData.title}` : "Create New Course"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update course syllabus, pricing, and showcase status."
              : "Add a new accredited technical course to Altair Academy."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Core Information</CardTitle>
            <CardDescription>Basic course details and public identifiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="e.g. Visual Testing (VT) Level 1 & 2"
                {...register("title")}
                onChange={handleTitleChange}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-slug">URL Slug</Label>
                <Input
                  id="course-slug"
                  placeholder="e.g. visual-testing-vt-level-1-2"
                  {...register("slug")}
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course-category">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="course-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course-summary">Course Summary</Label>
              <Textarea
                id="course-summary"
                rows={3}
                placeholder="Comprehensive overview of learning objectives, techniques, and practical training..."
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-xs text-destructive">{errors.summary.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Schedule & Pricing</CardTitle>
            <CardDescription>Format, certification level, duration and cost.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-level">Level (Optional)</Label>
                <Input
                  id="course-level"
                  placeholder="e.g. Level 1 & 2"
                  defaultValue={initialData?.level ?? ""}
                  onChange={(e) =>
                    setValue("level", e.target.value.trim() ? e.target.value : null, {
                      shouldValidate: true,
                    })
                  }
                />
                {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  placeholder="e.g. 5 Days (40 Hours)"
                  {...register("duration")}
                />
                {errors.duration && (
                  <p className="text-xs text-destructive">{errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course-price">Price</Label>
                <Input id="course-price" placeholder="e.g. £1,450 + VAT" {...register("price")} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Image & Media</CardTitle>
            <CardDescription>Banner image shown on cards and detail views.</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} folder="courses" />
              )}
            />
            {errors.image && (
              <p className="text-xs text-destructive mt-1">{errors.image.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Display & Status Settings</CardTitle>
            <CardDescription>
              Control visibility, order, and home showcase placement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Feature on Homepage</Label>
                <p className="text-xs text-muted-foreground">
                  Showcase this course in the curated Featured Courses carousel on the home page.
                </p>
              </div>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-order">Display Order</Label>
                <Input id="course-order" type="number" min={0} {...register("order")} />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course-status">Publication Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="course-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE (Published publicly)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Hidden from public)</SelectItem>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/admin/courses">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Course"
            ) : (
              "Create Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
