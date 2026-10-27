/**
 * News Posts Table Client Component
 *
 * Renders news posts with kind badges, published dates, status toggles,
 * and deletion dialogs.
 *
 * Location: src/app/admin/(dashboard)/news/NewsTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setNewsPostStatusAction, deleteNewsPostAction } from "@/app/admin/news/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { formatNewsDate } from "@/lib/format";
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
import { Plus, Pencil, Trash2, ExternalLink, Search, Newspaper } from "lucide-react";
import type { NewsKind } from "@prisma/client";

interface NewsPostRow {
  id: string;
  slug: string;
  title: string;
  kind: NewsKind;
  category: string | null;
  publishedAt: Date;
  status: "ACTIVE" | "INACTIVE";
}

interface NewsTableProps {
  items: NewsPostRow[];
}

export function NewsTable({ items }: NewsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [kindFilter, setKindFilter] = React.useState<string>("ALL");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    const matchesKind = kindFilter === "ALL" || item.kind === kindFilter;

    return matchesSearch && matchesStatus && matchesKind;
  });

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteNewsPostAction(id);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
    } catch (err) {
      console.error("[NewsTable] Delete error:", err);
      toast.error("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            News & Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage featured news stories, industry updates, and editor picks. ({items.length} posts)
          </p>
        </div>
        <Button asChild className="bg-navy hover:bg-navy/90 text-primary-foreground">
          <Link href="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" /> Add News Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Kind" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Kinds</SelectItem>
              <SelectItem value="FEATURED">Featured Hero</SelectItem>
              <SelectItem value="STORY">Industry Story</SelectItem>
              <SelectItem value="PICK">Editor Pick</SelectItem>
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
              <TableHead>Title</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Newspaper className="h-8 w-8 text-muted-foreground/60" />
                    <p>No news posts found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium text-foreground block max-w-md truncate">
                        {post.title}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">/{post.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        post.kind === "FEATURED"
                          ? "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                          : post.kind === "STORY"
                            ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                      }
                    >
                      {post.kind}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatNewsDate(new Date(post.publishedAt))}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch
                      id={post.id}
                      initialStatus={post.status}
                      onToggle={setNewsPostStatusAction}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {post.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href="/news"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview in News section"
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
                      title="Edit Post"
                    >
                      <Link href={`/admin/news/${post.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteDialog
                      title={`Delete "${post.title}"?`}
                      description="Are you sure you want to delete this news post? This action cannot be undone."
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => handleDelete(post.id)}
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
