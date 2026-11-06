/**
 * Testimonials Management Interactive Client View
 *
 * Provides paginated testimonials table, search and status filtering,
 * modal create/edit dialog with live character counter, optimistic status switch,
 * and deletion confirmation.
 *
 * Location: src/app/admin/(dashboard)/testimonials/TestimonialsManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import {
  testimonialSchema,
  type TestimonialInput,
  type TestimonialFormValues,
} from "@/lib/validation/testimonial";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  setTestimonialStatus,
} from "@/app/admin/testimonials/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
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
  Search,
  Quote,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { Status } from "@prisma/client";

export interface TestimonialRow {
  id: string;
  quote: string;
  name: string;
  company: string | null;
  order: number;
  status: Status;
}

interface TestimonialsManagerProps {
  items: TestimonialRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function TestimonialsManager({
  items,
  total,
  page,
  pageSize,
  totalPages,
}: TestimonialsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TestimonialRow | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestimonialFormValues, unknown, TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      quote: "",
      name: "",
      company: "",
      order: 0,
      status: "ACTIVE",
    },
  });

  const quoteValue = watch("quote") || "";
  const quoteLength = quoteValue.length;

  const applyFilters = (newQ: string, newStatus: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/testimonials${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentStatus, 1);
  };

  const handleStatusFilterChange = (val: string) => {
    applyFilters(searchTerm, val, 1);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      quote: "",
      name: "",
      company: "",
      order: total + 1,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: TestimonialRow) => {
    setEditingItem(item);
    reset({
      quote: item.quote,
      name: item.name,
      company: item.company ?? "",
      order: item.order,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: TestimonialInput) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const result = await updateTestimonial(editingItem.id, data);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
      } else {
        const result = await createTestimonial(data);
        handleAdminActionResult(result, () => {
          setDialogOpen(false);
          router.refresh();
        });
      }
    } catch (err) {
      console.error("[TestimonialsManager] Submit error:", err);
      toast.error("An unexpected error occurred. Please refresh the page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTestimonial(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[TestimonialsManager] Delete error:", err);
      toast.error("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Testimonials
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage student reviews and employer feedback shown on the public landing page. ({total}{" "}
            total)
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-navy hover:bg-navy/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by quote, student name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </form>

        <div className="w-full sm:w-44">
          <Select value={currentStatus} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">Order</TableHead>
              <TableHead className="min-w-[280px]">Quote</TableHead>
              <TableHead className="w-36">Student</TableHead>
              <TableHead className="w-44">Company</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Quote className="h-8 w-8 text-muted-foreground/60" />
                    <p>No testimonials found. Create your first testimonial above.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const quotePreview =
                  item.quote.length > 80 ? `${item.quote.slice(0, 80)}…` : item.quote;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.order}</TableCell>
                    <TableCell className="font-normal text-foreground text-sm max-w-md">
                      <span title={item.quote}>“{quotePreview}”</span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-sm">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.company || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusSwitch
                        id={item.id}
                        initialStatus={item.status}
                        onToggle={setTestimonialStatus}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Testimonial"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteDialog
                        title="Delete Testimonial?"
                        description={`Are you sure you want to delete the testimonial by "${item.name}"? This action cannot be undone.`}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        onConfirm={() => handleDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span> ({total} testimonials)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilters(currentQ, currentStatus, page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilters(currentQ, currentStatus, page + 1)}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingItem ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update student quote, identity details, or sequencing order."
                : "Create a verified student or client testimonial for the public carousel."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Quote with character counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="testimonial-quote">Quote</Label>
                <span
                  className={`text-[11px] tabular-nums ${
                    quoteLength > 600
                      ? "text-destructive font-semibold"
                      : quoteLength < 10 && quoteLength > 0
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {quoteLength} / 600 characters {quoteLength < 10 && "(min 10)"}
                </span>
              </div>
              <Textarea
                id="testimonial-quote"
                rows={4}
                placeholder="Share the student's direct feedback about courses, instructors, and practical labs..."
                {...register("quote")}
              />
              {errors.quote && <p className="text-xs text-destructive">{errors.quote.message}</p>}
            </div>

            {/* Student Name */}
            <div className="space-y-1.5">
              <Label htmlFor="testimonial-name">Student / Author Name</Label>
              <Input id="testimonial-name" placeholder="e.g. Syafiq" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Company / Employer */}
            <div className="space-y-1.5">
              <Label htmlFor="testimonial-company">
                Company / Organization{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="testimonial-company"
                placeholder="e.g. Lac Inspection Sdn Bhd"
                {...register("company")}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>

            {/* Order and Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="testimonial-order">Display Order</Label>
                <Input
                  id="testimonial-order"
                  type="number"
                  min={0}
                  max={9999}
                  {...register("order")}
                />
                {errors.order && <p className="text-xs text-destructive">{errors.order.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="testimonial-status">Status</Label>
                <Select
                  defaultValue={watch("status") || "ACTIVE"}
                  onValueChange={(val: "ACTIVE" | "INACTIVE") => setValue("status", val)}
                >
                  <SelectTrigger id="testimonial-status" className="bg-card">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
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
                ) : editingItem ? (
                  "Update Testimonial"
                ) : (
                  "Create Testimonial"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
