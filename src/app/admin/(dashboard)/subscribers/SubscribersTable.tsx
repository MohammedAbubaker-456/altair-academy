/**
 * Admin Newsletter Subscribers Table Component
 *
 * Client Component for viewing, searching, filtering, and managing subscribers.
 * Includes status toggling (ACTIVE/UNSUBSCRIBED) with optimistic rollback,
 * single-click delete confirmation, and multi-scope CSV direct download menu.
 *
 * Location: src/app/admin/(dashboard)/subscribers/SubscribersTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setSubscriberStatusAction, deleteSubscriberAction } from "@/app/admin/subscribers/actions";
import { formatDateTime, TIMEZONE_LABEL } from "@/lib/date";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  Trash2,
  Mail,
  Clock,
  Inbox,
  UserX,
  UserCheck,
} from "lucide-react";
import type { SubscriberStatus } from "@prisma/client";

export interface SubscriberRow {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string;
  unsubscribeToken: string;
  subscribedAt: Date | string;
  unsubscribedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SubscribersTableProps {
  items: SubscriberRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function SubscribersTable({ items, total, page, totalPages }: SubscribersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, SubscriberStatus>>({});

  const applyFilters = (newQ: string, newStatus: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/subscribers${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentStatus, 1);
  };

  const handleStatusFilterChange = (val: string) => {
    applyFilters(searchTerm, val, 1);
  };

  const handleStatusChange = async (id: string, newStatus: SubscriberStatus) => {
    const previous = localStatuses[id] || items.find((i) => i.id === id)?.status || "ACTIVE";
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));

    try {
      const result = await setSubscriberStatusAction(id, newStatus);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
      if (!result.ok) {
        setLocalStatuses((prev) => ({ ...prev, [id]: previous }));
      }
    } catch {
      setLocalStatuses((prev) => ({ ...prev, [id]: previous }));
      toast.error("Failed to update subscriber status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSubscriberAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch {
      toast.error("An unexpected error occurred while deleting the subscriber");
    }
  };

  const getStatusBadge = (status: SubscriberStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold text-xs">
            ACTIVE
          </Badge>
        );
      case "UNSUBSCRIBED":
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold text-xs">
            UNSUBSCRIBED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Status Filter, Timezone, and Export Menu */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </form>

        <div className="flex items-center gap-3">
          <Select value={currentStatus} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[150px] text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active only</SelectItem>
              <SelectItem value="UNSUBSCRIBED">Unsubscribed only</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Timezone: {TIMEZONE_LABEL}</span>
          </div>

          {/* Export CSV Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 font-medium">
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <a
                  href="/admin/subscribers/export?scope=active"
                  download
                  className="cursor-pointer flex items-center justify-between w-full text-xs py-2"
                >
                  <span>Active subscribers only</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold uppercase">
                    Default
                  </span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/admin/subscribers/export?scope=all"
                  download
                  className="cursor-pointer text-xs py-2"
                >
                  All subscribers
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[260px]">Email Address</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[120px]">Source</TableHead>
              <TableHead className="w-[200px]">Subscribed ({TIMEZONE_LABEL})</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Inbox className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No subscribers found</p>
                    <p className="text-xs text-muted-foreground/75 mt-0.5">
                      {currentQ || currentStatus !== "ALL"
                        ? "Try clearing your search query or status filter."
                        : "Subscribers who sign up via the public footer will appear here."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((sub) => {
                const currentStatusValue = localStatuses[sub.id] || sub.status;
                const isSubActive = currentStatusValue === "ACTIVE";

                return (
                  <TableRow key={sub.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground text-sm truncate max-w-[240px]">
                          {sub.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentStatusValue}
                        onValueChange={(val) => handleStatusChange(sub.id, val as SubscriberStatus)}
                      >
                        <SelectTrigger className="h-7 w-[130px] text-xs">
                          <SelectValue>{getStatusBadge(currentStatusValue)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="UNSUBSCRIBED">UNSUBSCRIBED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px] uppercase">
                        {sub.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(sub.subscribedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleStatusChange(sub.id, isSubActive ? "UNSUBSCRIBED" : "ACTIVE")
                          }
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title={isSubActive ? "Mark as Unsubscribed" : "Reactivate Subscriber"}
                        >
                          {isSubActive ? (
                            <UserX className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <DeleteDialog
                          title="Delete Newsletter Subscriber"
                          description={`Are you sure you want to delete the subscriber "${sub.email}"? This action cannot be undone.`}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Subscriber"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                          onConfirm={() => handleDelete(sub.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <div>
          Showing {items.length} of {total} total subscriber{total === 1 ? "" : "s"}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => applyFilters(currentQ, currentStatus, page - 1)}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => applyFilters(currentQ, currentStatus, page + 1)}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
