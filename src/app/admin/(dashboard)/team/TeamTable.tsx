/**
 * Team Members Table Client Component
 *
 * Renders team and instructor records with placement badges, status switches,
 * live search, and deletion dialogs.
 *
 * Location: src/app/admin/(dashboard)/team/TeamTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setTeamMemberStatusAction, deleteTeamMemberAction } from "@/app/admin/team/actions";
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
import { Plus, Pencil, Trash2, ExternalLink, Search, Users } from "lucide-react";
import type { TeamPlacement } from "@prisma/client";

interface TeamMemberRow {
  id: string;
  slug: string;
  name: string;
  role: string;
  instructorName: string | null;
  instructorRole: string | null;
  placements: TeamPlacement[];
  managementOrder: number;
  instructorOrder: number;
  status: "ACTIVE" | "INACTIVE";
}

interface TeamTableProps {
  items: TeamMemberRow[];
}

export function TeamTable({ items }: TeamTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [placementFilter, setPlacementFilter] = React.useState<string>("ALL");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.instructorName && item.instructorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    const matchesPlacement =
      placementFilter === "ALL" || item.placements.includes(placementFilter as TeamPlacement);

    return matchesSearch && matchesStatus && matchesPlacement;
  });

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTeamMemberAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[TeamTable] Delete error:", err);
      toast.error("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Team & Instructors
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage executive leadership and technical training faculty. ({items.length} members)
          </p>
        </div>
        <Button asChild className="bg-navy hover:bg-navy/90 text-primary-foreground">
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or instructor title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Placements</SelectItem>
              <SelectItem value="MANAGEMENT">Management</SelectItem>
              <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Status" />
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
              <TableHead>Member</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Placements</TableHead>
              <TableHead className="text-center">Order (Mgmt / Inst)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p>No team members found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium text-foreground block">{member.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        /{member.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-medium text-foreground">{member.role}</p>
                      {member.instructorRole && member.instructorRole !== member.role && (
                        <p className="text-muted-foreground text-[11px]">
                          Faculty: {member.instructorRole}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.placements.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className={
                            p === "MANAGEMENT"
                              ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                              : "bg-purple-50 text-purple-700 border-purple-200 text-[10px]"
                          }
                        >
                          {p === "MANAGEMENT" ? "Leadership" : "Faculty"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {member.managementOrder} / {member.instructorOrder}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={member.id}
                      initialStatus={member.status}
                      onToggle={setTeamMemberStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {member.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href={
                            member.placements.includes("MANAGEMENT")
                              ? `/team/${member.slug}`
                              : "/instructors"
                          }
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
                      title="Edit Member"
                    >
                      <Link href={`/admin/team/${member.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteDialog
                      title={`Delete "${member.name}"?`}
                      description="Are you sure you want to remove this team member? This action cannot be undone."
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => handleDelete(member.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
