/**
 * Admin Leads Table Client Component
 *
 * Displays searchable, filterable, paginated customer enquiry leads.
 * Renders dates with explicit timezone and locale, supports quick status changes,
 * and handles lead deletion with confirmation.
 *
 * Location: src/app/admin/(dashboard)/leads/LeadsTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setLeadStatusAction, deleteLeadAction } from "@/app/admin/leads/actions";
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
  ExternalLink,
  Trash2,
  Mail,
  Phone,
  Clock,
  Inbox,
} from "lucide-react";
import type { LeadStatus } from "@prisma/client";

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  source: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface LeadsTableProps {
  items: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function LeadsTable({ items, total, page, totalPages }: LeadsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [searchTerm, setSearchTerm] = React.useState(currentQ);
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, LeadStatus>>({});

  const applyFilters = (newQ: string, newStatus: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    router.push(`/admin/leads${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, currentStatus, 1);
  };

  const handleStatusFilterChange = (val: string) => {
    applyFilters(searchTerm, val, 1);
  };

  const handleQuickStatusChange = async (id: string, newStatus: LeadStatus) => {
    const previous = localStatuses[id] || items.find((i) => i.id === id)?.status || "NEW";
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));

    try {
      const result = await setLeadStatusAction(id, newStatus);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
      if (!result.ok) {
        setLocalStatuses((prev) => ({ ...prev, [id]: previous }));
      }
    } catch {
      setLocalStatuses((prev) => ({ ...prev, [id]: previous }));
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteLeadAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch {
      toast.error("An unexpected error occurred while deleting the lead");
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-semibold text-xs">
            NEW
          </Badge>
        );
      case "CONTACTED":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold text-xs">
            CONTACTED
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold text-xs">
            CLOSED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </form>

        <div className="flex items-center gap-3">
          <Select value={currentStatus} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[160px] text-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New Leads</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Timezone: {TIMEZONE_LABEL}</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[170px]">Date &amp; Time ({TIMEZONE_LABEL})</TableHead>
              <TableHead className="w-[180px]">Contact</TableHead>
              <TableHead className="w-[160px]">Phone</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Inbox className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No leads found</p>
                    <p className="text-xs text-muted-foreground/75 mt-0.5">
                      {currentQ || currentStatus !== "ALL"
                        ? "Try clearing your search query or status filter."
                        : "Enquiries submitted on the website contact page will appear here."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((lead) => {
                const currentStatusValue = localStatuses[lead.id] || lead.status;
                const messageSnippet =
                  lead.message.length > 75 ? `${lead.message.slice(0, 75).trim()}…` : lead.message;

                return (
                  <TableRow key={lead.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(lead.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-medium text-foreground hover:text-brand-red hover:underline block truncate max-w-[160px]"
                        >
                          {lead.name}
                        </Link>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[160px]"
                        >
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${lead.phone.replace(/[\s\-()]/g, "")}`}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{lead.phone}</span>
                      </a>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground block max-w-md line-clamp-2"
                        title={lead.message}
                      >
                        {messageSnippet}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentStatusValue}
                        onValueChange={(val) => handleQuickStatusChange(lead.id, val as LeadStatus)}
                      >
                        <SelectTrigger className="h-7 w-[125px] text-xs">
                          <SelectValue>{getStatusBadge(currentStatusValue)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">NEW</SelectItem>
                          <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                          <SelectItem value="CLOSED">CLOSED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/admin/leads/${lead.id}`} title="View Details">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <DeleteDialog
                          title="Delete Lead Enquiry"
                          description={`Are you sure you want to delete the enquiry from "${lead.name}"? This action cannot be undone.`}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                          onConfirm={() => handleDelete(lead.id)}
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
          Showing {items.length} of {total} total lead{total === 1 ? "" : "s"}
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
