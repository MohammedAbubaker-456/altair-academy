/**
 * Careers Table Client Component
 *
 * Renders the job openings inventory with live search, status filtering, pagination,
 * optimistic status switches, and deletion modals.
 *
 * Location: src/app/admin/(dashboard)/careers/CareersTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { setJobOpeningStatusAction, deleteJobOpeningAction } from "@/app/admin/careers/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { formatEmploymentType } from "@/lib/careers";
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
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { EmploymentType, Status } from "@prisma/client";

export interface JobOpeningRow {
  id: string;
  title: string;
  employmentType: EmploymentType;
  location: string;
  scope: string;
  order: number;
  status: Status;
}

interface CareersTableProps {
  items: JobOpeningRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function CareersTable({ items, total, page, totalPages }: CareersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);

  const applyFilters = (newQ: string, newStatus: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/careers${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentStatus, 1);
  };

  const handleStatusChange = (val: string) => {
    applyFilters(searchTerm, val, 1);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteJobOpeningAction(id);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Careers &amp; Open Positions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage instructor, assessor, and coordinator job opportunities. ({total} total)
          </p>
        </div>
        <Button asChild className="bg-navy hover:bg-navy/90 text-primary-foreground">
          <Link href="/admin/careers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Open Position
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, scope, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </form>

        <div className="w-full sm:w-44">
          <Select value={currentStatus} onValueChange={handleStatusChange}>
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

      {/* Table Card */}
      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-16 text-center">Order</TableHead>
              <TableHead>Role &amp; Scope</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Briefcase className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No job openings found</p>
                    <p className="text-xs text-muted-foreground/75 mt-0.5">
                      {currentQ || currentStatus !== "ALL"
                        ? "Try adjusting your search query or filters"
                        : "Click 'Add Open Position' above to create your first opening"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-center text-muted-foreground font-semibold">
                    {item.order}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded text-foreground/80">
                        {item.scope}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {formatEmploymentType(item.employmentType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-brand-red shrink-0" />
                      {item.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={item.id}
                      initialStatus={item.status}
                      onToggle={setJobOpeningStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Edit Job Opening">
                        <Link href={`/admin/careers/${item.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteDialog
                        title="Delete Job Opening"
                        description={`Are you sure you want to permanently delete '${item.title}'? This action cannot be undone.`}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            title="Delete opening"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        }
                        onConfirm={() => handleDelete(item.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} openings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => applyFilters(searchTerm, currentStatus, page - 1)}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => applyFilters(searchTerm, currentStatus, page + 1)}
              className="text-xs"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
