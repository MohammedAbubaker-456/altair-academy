/**
 * Courses Table Client Component
 *
 * Renders the course inventory with live search, status filtering, pagination,
 * optimistic status switches, and deletion modals.
 *
 * Location: src/app/admin/(dashboard)/courses/CoursesTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setCourseStatusAction, deleteCourseAction } from "@/app/admin/courses/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  Star,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  level: string | null;
  duration: string;
  price: string;
  order: number;
  isFeatured: boolean;
  status: "ACTIVE" | "INACTIVE";
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface CoursesTableProps {
  items: CourseRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories?: Array<{ id: string; name: string }>;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    parentId: string | null;
  }>;
}

export function CoursesTable({
  items,
  total,
  page,
  totalPages,
  categories = [],
  subcategories = [],
}: CoursesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";
  const currentCategoryId = searchParams.get("categoryId") ?? "ALL";
  const currentSubcategoryId = searchParams.get("subcategoryId") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);

  // Available subcategories for the selected category filter
  const categorySubcategories = React.useMemo(() => {
    if (!currentCategoryId || currentCategoryId === "ALL") return [];
    return subcategories.filter((s) => s.categoryId === currentCategoryId);
  }, [subcategories, currentCategoryId]);

  const applyFilters = (
    newQ: string,
    newStatus: string,
    newCat: string,
    newSub: string,
    newPage = 1,
  ) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newCat && newCat !== "ALL") params.set("categoryId", newCat);
    if (newSub && newSub !== "ALL") params.set("subcategoryId", newSub);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/courses${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentStatus, currentCategoryId, currentSubcategoryId, 1);
  };

  const handleStatusChange = (val: string) => {
    applyFilters(searchTerm, val, currentCategoryId, currentSubcategoryId, 1);
  };

  const handleCategoryChange = (val: string) => {
    // Reset subcategory filter when category filter changes
    applyFilters(searchTerm, currentStatus, val, "ALL", 1);
  };

  const handleSubcategoryChange = (val: string) => {
    applyFilters(searchTerm, currentStatus, currentCategoryId, val, 1);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCourseAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[CoursesTable] Delete error:", err);
      toast.error("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage course certifications, curriculums, and featured offerings. ({total} total)
          </p>
        </div>
        <Button asChild className="bg-navy hover:bg-navy/90 text-primary-foreground">
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, summary, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </form>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active Only</SelectItem>
                <SelectItem value="INACTIVE">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <Select value={currentCategoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Filter (Depends on chosen Category) */}
          <div className="w-full sm:w-48">
            <Select
              value={currentSubcategoryId}
              onValueChange={handleSubcategoryChange}
              disabled={currentCategoryId === "ALL" || categorySubcategories.length === 0}
            >
              <SelectTrigger className="bg-card">
                <SelectValue
                  placeholder={
                    currentCategoryId === "ALL"
                      ? "Select category"
                      : categorySubcategories.length === 0
                        ? "No subcategories"
                        : "All Subcategories"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Subcategories</SelectItem>
                {categorySubcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-14">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Level / Duration</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <GraduationCap className="h-8 w-8 text-muted-foreground/60" />
                    <p>No courses matched your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono text-xs">{course.order}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-foreground block">{course.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        /{course.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-xs">
                      {course.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.subcategory ? (
                      <Badge variant="secondary" className="font-normal text-xs">
                        {course.subcategory.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{course.level || "—"}</div>
                    <div className="text-[11px] font-mono text-foreground/70">
                      {course.duration}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {course.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Home
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={course.id}
                      initialStatus={course.status}
                      onToggle={setCourseStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {course.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href={`/courses/${course.slug}`}
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
                      asChild
                      title="Edit Course"
                    >
                      <Link href={`/admin/courses/${course.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteDialog
                      title={`Delete "${course.title}"?`}
                      description="Are you sure you want to delete this course? Its uploaded images will also be cleaned up. This action cannot be undone."
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => handleDelete(course.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => applyFilters(currentQ, currentStatus, page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => applyFilters(currentQ, currentStatus, page + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
