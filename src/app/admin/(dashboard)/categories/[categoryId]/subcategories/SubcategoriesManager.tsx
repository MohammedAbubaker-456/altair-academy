/**
 * Subcategories Management Interactive Client View
 *
 * Provides subcategory hierarchy table with visual indentation, create/edit dialog modal,
 * slug generation, optimistic status switches, and course/child-dependency delete safeguards.
 *
 * Location: src/app/admin/(dashboard)/categories/[categoryId]/subcategories/SubcategoriesManager.tsx
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
import { subcategorySchema, type SubcategoryInput } from "@/lib/validation/subcategory";
import { slugify } from "@/lib/slugify";
import {
  createSubcategoryAction,
  updateSubcategoryAction,
  deleteSubcategoryAction,
  setSubcategoryStatusAction,
} from "@/app/admin/categories/subcategory-actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
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
  ExternalLink,
  Loader2,
  CornerDownRight,
  ChevronRight,
  FolderTree,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubcategoryRow {
  id: string;
  name: string;
  slug: string;
  order: number;
  status: "ACTIVE" | "INACTIVE";
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { courses: number; children: number };
}

interface SubcategoriesManagerProps {
  category: {
    id: string;
    name: string;
    slug: string;
    status: "ACTIVE" | "INACTIVE";
  };
  subcategories: SubcategoryRow[];
}

export function SubcategoriesManager({ category, subcategories }: SubcategoriesManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSubcategory, setEditingSubcategory] = React.useState<SubcategoryRow | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<SubcategoryInput>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      order: 0,
      status: "ACTIVE",
    },
  });

  const nameValue = watch("name");

  // Top-level subcategories that can be chosen as parent
  const topLevelSubcategories = React.useMemo(() => {
    return subcategories.filter(
      (s) => !s.parentId && (!editingSubcategory || s.id !== editingSubcategory.id),
    );
  }, [subcategories, editingSubcategory]);

  // Order items hierarchically: parent followed by its children
  const hierarchicalItems = React.useMemo(() => {
    const result: Array<SubcategoryRow & { depth: number }> = [];
    const topLevels = subcategories.filter((s) => !s.parentId);
    const visitedIds = new Set<string>();

    topLevels.forEach((top) => {
      result.push({ ...top, depth: 0 });
      visitedIds.add(top.id);

      const children = subcategories.filter((s) => s.parentId === top.id);
      children.forEach((child) => {
        result.push({ ...child, depth: 1 });
        visitedIds.add(child.id);
      });
    });

    // Catch any orphaned items if any
    subcategories.forEach((s) => {
      if (!visitedIds.has(s.id)) {
        result.push({ ...s, depth: 0 });
      }
    });

    return result;
  }, [subcategories]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingSubcategory(null);
    reset({
      name: "",
      slug: "",
      parentId: null,
      order: subcategories.length,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (sub: SubcategoryRow) => {
    setEditingSubcategory(sub);
    reset({
      name: sub.name,
      slug: sub.slug,
      parentId: sub.parentId ?? null,
      order: sub.order,
      status: sub.status,
    });
    setDialogOpen(true);
  };

  // Auto-generate slug when name changes in Add mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value, { shouldValidate: true });
    if (!editingSubcategory) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  // Submit Handler
  const onSubmit = async (data: SubcategoryInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        parentId: data.parentId && data.parentId.trim() ? data.parentId.trim() : null,
      };

      if (editingSubcategory) {
        const result = await updateSubcategoryAction(editingSubcategory.id, payload);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
      } else {
        const result = await createSubcategoryAction(category.id, payload);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
      }
    } catch (err) {
      console.error("[SubcategoriesManager] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSubcategoryAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[SubcategoriesManager] Delete error:", err);
      toast.error("An unexpected error occurred while deleting.");
    }
  };

  const editingHasChildren = Boolean(editingSubcategory && editingSubcategory._count.children > 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/categories"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Categories</span>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <span className="font-medium text-foreground">{category.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <span className="text-foreground">Subcategories</span>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            {category.name} Subcategories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage course subcategories and nesting levels for {category.name}. (
            {subcategories.length} total)
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-navy hover:bg-navy/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Subcategory
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-center">Courses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hierarchicalItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderTree className="h-8 w-8 text-muted-foreground/60" />
                    <p>
                      No subcategories found for {category.name}. Click "Add Subcategory" to create
                      one.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              hierarchicalItems.map((sub) => {
                const isChild = sub.depth > 0;
                return (
                  <TableRow key={sub.id} className={cn(isChild && "bg-muted/15")}>
                    <TableCell className="font-mono text-xs">{sub.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {isChild && (
                          <div className="mr-2 flex items-center text-muted-foreground/70 pl-4">
                            <CornerDownRight className="h-4 w-4" />
                          </div>
                        )}
                        <span
                          className={cn(
                            "font-medium text-foreground",
                            isChild ? "text-sm text-foreground/90" : "font-semibold",
                          )}
                        >
                          {sub.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {sub.slug}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.parent ? (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground font-medium">
                          {sub.parent.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">— (Top-level)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy">
                        {sub._count.courses}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusSwitch
                        id={sub.id}
                        initialStatus={sub.status}
                        onToggle={setSubcategoryStatusAction}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {sub.status === "ACTIVE" && category.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link
                            href={`/courses?category=${category.slug}&subcategory=${sub.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview filtered courses"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(sub)}
                        title="Edit Subcategory"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteDialog
                        title={`Delete "${sub.name}"?`}
                        description={
                          sub._count.courses > 0
                            ? `Cannot delete subcategory because ${sub._count.courses} course(s) use this subcategory. Please reassign or delete those courses first.`
                            : sub._count.children > 0
                              ? `Cannot delete subcategory because it has ${sub._count.children} child subcategor(ies). Delete its child subcategories first.`
                              : "Are you sure you want to delete this subcategory? This action cannot be undone."
                        }
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        onConfirm={() => handleDelete(sub.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingSubcategory ? "Edit Subcategory" : "Create Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? `Update details and hierarchy for "${editingSubcategory.name}" in ${category.name}.`
                : `Add a new subcategory under the "${category.name}" category.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-name">Subcategory Name</Label>
              <Input
                id="sub-name"
                placeholder="e.g. ASNT Courses, Level 1, or Beginner"
                {...register("name")}
                onChange={handleNameChange}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="sub-slug">URL Slug</Label>
              <Input
                id="sub-slug"
                placeholder="e.g. asnt-courses or level-1"
                {...register("slug")}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              <p className="text-[11px] text-muted-foreground">
                Unique within {category.name}. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Parent Selection */}
            {!editingHasChildren && (
              <div className="space-y-1.5">
                <Label htmlFor="sub-parent">Parent Subcategory</Label>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                    >
                      <SelectTrigger id="sub-parent">
                        <SelectValue placeholder="None (Top-level subcategory)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top-level subcategory)</SelectItem>
                        {topLevelSubcategories.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.parentId && (
                  <p className="text-xs text-destructive">{errors.parentId.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Select a parent to create a 2nd-level subcategory, or None for top-level.
                </p>
              </div>
            )}

            {editingHasChildren && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Top-level Subcategory</p>
                <p className="mt-0.5">
                  This subcategory currently has {editingSubcategory?._count.children} child
                  subcategor(ies). Subcategories with children must remain top-level.
                </p>
              </div>
            )}

            {/* Order & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sub-order">Display Order</Label>
                <Input id="sub-order" type="number" min={0} max={9999} {...register("order")} />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sub-status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="sub-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
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
                disabled={isSubmitting}
                className="bg-navy hover:bg-navy/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingSubcategory ? (
                  "Update Subcategory"
                ) : (
                  "Create Subcategory"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
