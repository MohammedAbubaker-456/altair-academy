/**
 * Legal Pages Table Client Component
 *
 * Displays the list of core and custom legal documents with public URLs,
 * footer visibility status, order sequencing, optimistic status switch,
 * and core page deletion protection.
 *
 * Location: src/app/admin/(dashboard)/legal/LegalTable.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteLegalPageAction, setLegalPageStatusAction } from "@/app/admin/legal/actions";
import { StatusSwitch } from "@/components/admin/StatusSwitch";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { legalHref } from "@/lib/legal";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { Status } from "@prisma/client";

export interface LegalTableRow {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  showInFooter: boolean;
  isCore: boolean;
  order: number;
  status: Status;
  updatedAt: Date;
}

interface LegalTableProps {
  pages: LegalTableRow[];
}

export function LegalTable({ pages }: LegalTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const result = await deleteLegalPageAction(id);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleStatus = async (
    id: string,
    newStatus: Status,
    isCore: boolean,
    slug: string,
  ) => {
    if (isCore && newStatus === "INACTIVE") {
      const confirmed = window.confirm(
        `Warning: Deactivating the core "${slug}" page will cause ${legalHref(
          slug,
        )} to return a 404 Not Found error and its link will be removed from the footer. Are you sure you want to proceed?`,
      );
      if (!confirmed) {
        return { ok: false, message: "Deactivation cancelled" };
      }
    }

    const result = await setLegalPageStatusAction(id, newStatus);
    if (result.ok) {
      router.refresh();
    }
    return result;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Legal &amp; Policy Pages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Privacy Policy, Terms of Service, and custom policy documents. Changes revalidate
            the site footer and public policy routes immediately.
          </p>
        </div>
        <Button
          asChild
          className="bg-navy hover:bg-navy/90 text-primary-foreground font-medium shrink-0"
        >
          <Link href="/admin/legal/new">
            <Plus className="mr-2 h-4 w-4" /> Add Legal Page
          </Link>
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Documents ({pages.length})</CardTitle>
          <CardDescription>
            System core pages are protected against deletion and slug changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground italic">
              No legal documents found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Public URL</TableHead>
                    <TableHead className="w-32">Footer Link</TableHead>
                    <TableHead className="w-32">Last Updated</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => {
                    const href = legalHref(page.slug);
                    const formattedDate = new Date(page.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow key={page.id}>
                        <TableCell className="font-mono text-xs">{page.order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{page.title}</span>
                            {page.isCore && (
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] py-0"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                Core
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-brand-red hover:underline"
                          >
                            <span>{href}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          {page.showInFooter ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200"
                            >
                              Visible
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formattedDate}
                        </TableCell>
                        <TableCell>
                          <StatusSwitch
                            id={page.id}
                            initialStatus={page.status}
                            onToggle={(id, newStatus) =>
                              handleToggleStatus(id, newStatus, page.isCore, page.slug)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild title="Edit document">
                              <Link href={`/admin/legal/${page.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            {page.isCore ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="text-muted-foreground/40 cursor-not-allowed"
                                title="Core documents cannot be deleted"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <DeleteDialog
                                title={`Delete ${page.title}?`}
                                description={`Are you sure you want to delete "${page.title}" (${page.slug})? This action will permanently remove the page from the website.`}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                }
                                onConfirm={() => handleDelete(page.id)}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
