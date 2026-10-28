/**
 * Admin Calendar Courses Management Tab
 *
 * Renders the course code inventory table with inline status toggles,
 * session count safeguards, helper callouts, and create/edit modal dialog.
 *
 * Location: src/app/admin/(dashboard)/calendar/CalendarCoursesTab.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setCourseStatusAction, deleteCourseAction } from "@/app/admin/calendar/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { CourseCodeDialog, type CourseCodeData } from "./CourseCodeDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Info, BookOpen } from "lucide-react";

export interface CourseWithSessionCount {
  id: string;
  code: string;
  name: string;
  order: number;
  status: "ACTIVE" | "INACTIVE";
  _count: {
    sessions: number;
  };
}

interface CalendarCoursesTabProps {
  courses: CourseWithSessionCount[];
}

export function CalendarCoursesTab({ courses }: CalendarCoursesTabProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<CourseCodeData | null>(null);

  const handleOpenAdd = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseWithSessionCount) => {
    setSelectedCourse({
      id: course.id,
      code: course.code,
      name: course.name,
      order: course.order,
      status: course.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (course: CourseWithSessionCount) => {
    if (course._count.sessions > 0) {
      toast.error(
        `Delete or move its ${course._count.sessions} session${course._count.sessions > 1 ? "s" : ""} first`,
      );
      return;
    }

    try {
      const result = await deleteCourseAction(course.id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[CalendarCoursesTab] Delete error:", err);
      toast.error("Failed to delete course code.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
            Calendar Course Codes
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage course codes used on the public calendar schedule. ({courses.length} codes)
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-navy hover:bg-navy/90 text-primary-foreground shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Course Code
        </Button>
      </div>

      {/* Helper text callout */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900">
        <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
        <div>
          <span className="font-semibold">Public Calendar Visibility:</span> Setting a course code
          to <strong>INACTIVE</strong> immediately hides the course and all of its scheduled
          sessions from the public calendar page.
        </div>
      </div>

      {/* Courses Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-28 font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Course Name</TableHead>
              <TableHead className="w-24 text-center font-semibold">Order</TableHead>
              <TableHead className="w-32 text-center font-semibold">Sessions</TableHead>
              <TableHead className="w-36 font-semibold">Status</TableHead>
              <TableHead className="w-24 text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium text-sm">No calendar courses defined yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAdd}
                      className="mt-2 text-xs"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Course Code
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const hasSessions = course._count.sessions > 0;
                return (
                  <TableRow key={course.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-primary">
                      <span className="inline-block rounded-md bg-navy/10 px-2 py-0.5 text-xs text-navy font-bold">
                        {course.code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-sm">
                      {course.name}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">
                      {course.order}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          hasSessions
                            ? "bg-navy/10 text-navy font-medium text-xs hover:bg-navy/20"
                            : "text-muted-foreground text-xs"
                        }
                      >
                        {course._count.sessions} session{course._count.sessions === 1 ? "" : "s"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusSwitch
                        id={course.id}
                        initialStatus={course.status}
                        onToggle={setCourseStatusAction}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(course)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Course Code"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit {course.code}</span>
                        </Button>

                        {hasSessions ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(course)}
                            className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                            title={`Cannot delete: ${course._count.sessions} session(s) attached`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {course.code}</span>
                          </Button>
                        ) : (
                          <DeleteDialog
                            title={`Delete Course Code "${course.code}"?`}
                            description={`Are you sure you want to delete course code "${course.code}" (${course.name})? This action cannot be undone.`}
                            onConfirm={() => handleDelete(course)}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete Course Code"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete {course.code}</span>
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog */}
      <CourseCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={selectedCourse}
        defaultOrder={courses.length}
      />
    </div>
  );
}
