/**
 * Course Create / Edit Form Component
 *
 * Full-featured interactive form for course content, image uploading to server disk,
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
import { handleAdminActionResult } from "@/lib/admin-client";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/site/MarkdownContent";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

export interface SubcategoryOption {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  parentId: string | null;
  status: "ACTIVE" | "INACTIVE";
  order: number;
}

interface CourseInitialData {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string | null;
  level: string | null;
  duration: string;
  price: string;
  summary: string;
  image: string | null;
  objective?: string | null;
  content?: string | null;
  whoShouldAttend?: string | null;
  certification?: string | null;
  notesAndEquipment?: string | null;
  classCapacity?: string | null;
  feeDetails?: string | null;
  courseSupport?: string | null;
  isFeatured: boolean;
  order: number;
  status: "ACTIVE" | "INACTIVE";
}

interface CourseFormProps {
  initialData?: CourseInitialData | null;
  categories: CategoryOption[];
  subcategories?: SubcategoryOption[];
}

function MarkdownFormField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
  rows = 5,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  maxLength: number;
  hint?: string | undefined;
  rows?: number | undefined;
  placeholder?: string | undefined;
  error?: string | undefined;
}) {
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const length = (value || "").length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span
          className={cn(
            "text-xs font-mono",
            length > maxLength ? "text-destructive font-semibold" : "text-muted-foreground",
          )}
        >
          {length.toLocaleString()} / {maxLength.toLocaleString()} characters
        </span>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")}>
        <div className="flex items-center justify-between gap-2">
          <TabsList className="grid w-36 grid-cols-2 h-8">
            <TabsTrigger value="write" className="text-xs">
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
          </TabsList>
          {hint && <span className="text-xs text-muted-foreground hidden sm:inline">{hint}</span>}
        </div>
        <TabsContent value="write" className="pt-2">
          <Textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </TabsContent>
        <TabsContent value="preview" className="pt-2">
          <MarkdownPreview
            content={value}
            placeholder={`No ${label.toLowerCase()} drafted yet. Switch to Write tab to add Markdown content.`}
          />
        </TabsContent>
      </Tabs>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PlainTextFormField({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  error,
  isTextarea = false,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  maxLength: number;
  placeholder?: string | undefined;
  error?: string | undefined;
  isTextarea?: boolean | undefined;
  rows?: number | undefined;
}) {
  const length = (value || "").length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span
          className={cn(
            "text-xs font-mono",
            length > maxLength ? "text-destructive font-semibold" : "text-muted-foreground",
          )}
        >
          {length.toLocaleString()} / {maxLength.toLocaleString()} characters
        </span>
      </div>
      {isTextarea ? (
        <Textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function CourseForm({
  initialData,
  categories,
  subcategories = [],
}: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      categoryId: initialData?.categoryId ?? (categories[0]?.id || ""),
      subcategoryId: initialData?.subcategoryId ?? null,
      level: initialData?.level ?? null,
      duration: initialData?.duration ?? "",
      price: initialData?.price ?? "",
      summary: initialData?.summary ?? "",
      image: initialData?.image ?? null,
      objective: initialData?.objective ?? "",
      content: initialData?.content ?? "",
      whoShouldAttend: initialData?.whoShouldAttend ?? "",
      certification: initialData?.certification ?? "",
      notesAndEquipment: initialData?.notesAndEquipment ?? "",
      classCapacity: initialData?.classCapacity ?? "",
      feeDetails: initialData?.feeDetails ?? "",
      courseSupport: initialData?.courseSupport ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      order: initialData?.order ?? 0,
      status: initialData?.status ?? "ACTIVE",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const prevCategoryRef = React.useRef(selectedCategoryId);

  // When category changes, reset subcategory
  React.useEffect(() => {
    if (prevCategoryRef.current !== selectedCategoryId) {
      prevCategoryRef.current = selectedCategoryId;
      setValue("subcategoryId", null, { shouldValidate: true });
    }
  }, [selectedCategoryId, setValue]);

  // Subcategories available for selected category
  const availableSubcategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter(
      (s) =>
        s.categoryId === selectedCategoryId &&
        (s.status === "ACTIVE" || s.id === initialData?.subcategoryId),
    );
  }, [subcategories, selectedCategoryId, initialData?.subcategoryId]);

  const hasNoSubcategories = availableSubcategories.length === 0;

  // Separate top-level subcategories with children from standalone subcategories
  const { groupedSubcategories, standaloneSubcategories } = React.useMemo(() => {
    const topLevels = availableSubcategories.filter((s) => !s.parentId);
    const children = availableSubcategories.filter((s) => s.parentId !== null);

    const grouped: Array<{
      parent: SubcategoryOption;
      children: SubcategoryOption[];
    }> = [];

    const standalone: SubcategoryOption[] = [];

    topLevels.forEach((top) => {
      const topChildren = children.filter((c) => c.parentId === top.id);
      if (topChildren.length > 0) {
        grouped.push({
          parent: top,
          children: topChildren,
        });
      } else {
        standalone.push(top);
      }
    });

    return { groupedSubcategories: grouped, standaloneSubcategories: standalone };
  }, [availableSubcategories]);

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
        handleAdminActionResult(result, () => {
          router.push("/admin/courses");
          router.refresh();
        });
      } else {
        const result = await createCourseAction(data);
        handleAdminActionResult(result, () => {
          router.push("/admin/courses");
          router.refresh();
        });
      }
    } catch (err) {
      console.error("[CourseForm] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
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
          <CardContent className="space-y-6">
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="course-slug">URL Slug</Label>
                  <Input
                    id="course-slug"
                    placeholder="e.g. visual-testing-vt-level-1-2"
                    {...register("slug")}
                  />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
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

                <div className="space-y-1.5">
                  <Label htmlFor="course-subcategory">Subcategory</Label>
                  <Controller
                    name="subcategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                        disabled={hasNoSubcategories}
                      >
                        <SelectTrigger id="course-subcategory">
                          <SelectValue
                            placeholder={
                              hasNoSubcategories
                                ? "No subcategories for this category"
                                : "Select a subcategory (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {standaloneSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                              {sub.status === "INACTIVE" ? " (inactive)" : ""}
                            </SelectItem>
                          ))}
                          {groupedSubcategories.map((group) => (
                            <SelectGroup key={group.parent.id}>
                              <SelectLabel>{group.parent.name}</SelectLabel>
                              <SelectItem value={group.parent.id}>
                                {group.parent.name} (general)
                                {group.parent.status === "INACTIVE" ? " (inactive)" : ""}
                              </SelectItem>
                              {group.children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                  {child.name}
                                  {child.status === "INACTIVE" ? " (inactive)" : ""}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {hasNoSubcategories && (
                    <p className="text-xs text-muted-foreground">
                      No subcategories for this category
                    </p>
                  )}
                  {errors.subcategoryId && (
                    <p className="text-xs text-destructive">{errors.subcategoryId.message}</p>
                  )}
                </div>
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

            {/* Detailed Course Sections */}
            <div className="border-t border-border pt-6 space-y-6">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Detailed Syllabus &amp; Specifications
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Optional sections rendered on the public course detail page. Markdown is supported
                  where indicated.
                </p>
              </div>

              {/* 1. Course Objective (Markdown, max 5,000) */}
              <Controller
                name="objective"
                control={control}
                render={({ field }) => (
                  <MarkdownFormField
                    id="course-objective"
                    label="Course Objective"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={5000}
                    hint="Supports Markdown (lists, bold, safe links). Max 5,000 chars."
                    placeholder="Comprehensive objectives and target competencies..."
                    error={errors.objective?.message}
                  />
                )}
              />

              {/* 2. Course Content (Markdown, max 10,000) */}
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MarkdownFormField
                    id="course-content"
                    label="Course Content"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={10000}
                    rows={7}
                    hint="Supports Markdown outline and body of knowledge. Max 10,000 chars."
                    placeholder="* Module 1: Introduction\n* Module 2: Inspection procedures..."
                    error={errors.content?.message}
                  />
                )}
              />

              {/* 3. Who Should Attend (Markdown, max 5,000) */}
              <Controller
                name="whoShouldAttend"
                control={control}
                render={({ field }) => (
                  <MarkdownFormField
                    id="course-who-should-attend"
                    label="Who Should Attend"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={5000}
                    hint="Supports Markdown bullet list styling. Max 5,000 chars."
                    placeholder="* Quality control and assurance personnel...\n* Plant managers and supervisors..."
                    error={errors.whoShouldAttend?.message}
                  />
                )}
              />

              {/* 4. Certification (plain text, max 300) */}
              <Controller
                name="certification"
                control={control}
                render={({ field }) => (
                  <PlainTextFormField
                    id="course-certification"
                    label="Certification"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={300}
                    placeholder="e.g. Certificate of attendance / API 510 Inspector Certificate"
                    error={errors.certification?.message}
                  />
                )}
              />

              {/* 5. Course Notes and Equipment (plain text, max 1,000) */}
              <Controller
                name="notesAndEquipment"
                control={control}
                render={({ field }) => (
                  <PlainTextFormField
                    id="course-notes-and-equipment"
                    label="Course Notes and Equipment"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={1000}
                    isTextarea
                    rows={3}
                    placeholder="e.g. Course notes, quizzes, and mockup exam papers supplied."
                    error={errors.notesAndEquipment?.message}
                  />
                )}
              />

              {/* 6. Class Capacity (plain text, max 100) */}
              <Controller
                name="classCapacity"
                control={control}
                render={({ field }) => (
                  <PlainTextFormField
                    id="course-class-capacity"
                    label="Class Capacity"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={100}
                    placeholder="e.g. 20 people"
                    error={errors.classCapacity?.message}
                  />
                )}
              />

              {/* 7. Course Fee (optional override) (Markdown, max 2,000) */}
              <Controller
                name="feeDetails"
                control={control}
                render={({ field }) => (
                  <MarkdownFormField
                    id="course-fee-details"
                    label="Course Fee (Optional Override)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={2000}
                    rows={4}
                    hint="Leave empty to display default email/WhatsApp inquiries block."
                    placeholder="Custom fee details or pricing schedule (Markdown supported)..."
                    error={errors.feeDetails?.message}
                  />
                )}
              />

              {/* 8. Course Support (Markdown, max 2,000) */}
              <Controller
                name="courseSupport"
                control={control}
                render={({ field }) => (
                  <MarkdownFormField
                    id="course-support"
                    label="Course Support"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    maxLength={2000}
                    rows={4}
                    hint="Online revision sessions, mentor support, etc. Max 2,000 chars."
                    placeholder="e.g. Complementary one-day online session and unlimited support on WhatsApp group..."
                    error={errors.courseSupport?.message}
                  />
                )}
              />
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
