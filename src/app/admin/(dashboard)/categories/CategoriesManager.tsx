/**
 * Categories Management Interactive Client View
 *
 * Provides category listing table, create/edit dialog modal with slug generation,
 * optimistic status switches, and course-dependency delete safeguards.
 *
 * Location: src/app/admin/(dashboard)/categories/CategoriesManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import { slugify } from "@/lib/slugify";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  setCategoryStatusAction,
} from "@/app/admin/categories/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, ExternalLink, Loader2, FolderTree } from "lucide-react";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  short: string;
  order: number;
  status: "ACTIVE" | "INACTIVE";
  _count: { courses: number };
}

interface CategoriesManagerProps {
  categories: CategoryWithCount[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryWithCount | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      short: "",
      order: 0,
      status: "ACTIVE",
    },
  });

  const nameValue = watch("name");

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingCategory(null);
    reset({
      name: "",
      slug: "",
      short: "",
      order: categories.length,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      short: category.short,
      order: category.order,
      status: category.status,
    });
    setDialogOpen(true);
  };

  // Auto-generate slug when name changes (only in create mode)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value, { shouldValidate: true });
    if (!editingCategory) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const result = await updateCategoryAction(editingCategory.id, data);
        if (result.ok) {
          toast.success(result.message);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createCategoryAction(data);
        if (result.ok) {
          toast.success(result.message);
          setDialogOpen(false);
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

  const handleDelete = async (id: string) => {
    const result = await deleteCategoryAction(id);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Course Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage course disciplines and classification groups.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-navy hover:bg-navy/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Courses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderTree className="h-8 w-8 text-muted-foreground/60" />
                    <p>No categories found. Create your first category above.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono text-xs">{category.order}</TableCell>
                  <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {category.short}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy">
                      {category._count.courses}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={category.id}
                      initialStatus={category.status}
                      onToggle={setCategoryStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {category.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href={`/courses?category=${category.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(category)}
                      title="Edit Category"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteDialog
                      title={`Delete "${category.name}"?`}
                      description={
                        category._count.courses > 0
                          ? `This category cannot be deleted because it still contains ${category._count.courses} course(s).`
                          : "Are you sure you want to delete this category? This action cannot be undone."
                      }
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => handleDelete(category.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details and classification."
                : "Create a new discipline category for course organization."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                placeholder="e.g. Non-Destructive Testing"
                {...register("name")}
                onChange={handleNameChange}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                placeholder="e.g. non-destructive-testing"
                {...register("slug")}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-short">Short Description</Label>
              <Textarea
                id="category-short"
                rows={3}
                placeholder="Brief summary of what this category covers..."
                {...register("short")}
              />
              {errors.short && <p className="text-xs text-destructive">{errors.short.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-order">Display Order</Label>
                <Input id="category-order" type="number" min={0} {...register("order")} />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-2">
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
                className="bg-navy hover:bg-navy/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
