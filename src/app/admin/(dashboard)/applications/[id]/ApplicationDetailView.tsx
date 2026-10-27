/**
 * Admin Application Detail View Component
 *
 * Client Component for viewing an applicant's complete profile, submitted cover message,
 * and attached resume document with View and Download capabilities.
 *
 * Location: src/app/admin/(dashboard)/applications/[id]/ApplicationDetailView.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import {
  setApplicationStatusAction,
  deleteApplicationAction,
} from "@/app/admin/applications/actions";
import { formatDateTime, TIMEZONE_LABEL } from "@/lib/date";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Trash2,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  Briefcase,
  Paperclip,
} from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialisation: string | null;
  message: string | null;
  resumeOriginalName: string | null;
  resumeStoredName: string | null;
  resumeMime: string | null;
  resumeSize: number | null;
  status: ApplicationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ApplicationDetailViewProps {
  application: ApplicationData;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<ApplicationStatus>(application.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    const previous = status;
    setStatus(newStatus);
    setIsUpdatingStatus(true);

    try {
      const result = await setApplicationStatusAction(application.id, newStatus);
      handleAdminActionResult(result, () => {
        router.refresh();
      });
      if (!result.ok) {
        setStatus(previous);
      }
    } catch {
      setStatus(previous);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteApplicationAction(application.id);
      handleAdminActionResult(result, () => {
        router.push("/admin/applications");
        router.refresh();
      });
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const cleanPhone = application.phone.replace(/[\s\-()]/g, "");
  const hasResume = Boolean(application.resumeStoredName);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
              {application.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Application submitted on {formatDateTime(application.createdAt)} ({TIMEZONE_LABEL})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="w-[150px]">
            <Select
              value={status}
              onValueChange={(val) => handleStatusChange(val as ApplicationStatus)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="REVIEWING">REVIEWING</SelectItem>
                <SelectItem value="SHORTLISTED">SHORTLISTED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Quick Action */}
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={`mailto:${application.email}?subject=Altair%20Academy%20Career%20Application`}>
              <Mail className="h-3.5 w-3.5 mr-1 text-primary" />
              Email
            </a>
          </Button>

          {/* Call Quick Action */}
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={`tel:${cleanPhone}`}>
              <Phone className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Call
            </a>
          </Button>

          {/* Delete Dialog */}
          <DeleteDialog
            title="Delete Candidate Application"
            description={`Are you sure you want to permanently delete the application for "${application.name}" and remove any stored resume file from disk? This cannot be undone.`}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            }
            onConfirm={handleDelete}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Information & Metadata */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Candidate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium text-foreground">{application.name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <a
                  href={`mailto:${application.email}`}
                  className="font-medium text-brand-red hover:underline break-all"
                >
                  {application.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone Number</span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-mono text-sm text-foreground hover:underline"
                >
                  {application.phone}
                </a>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Specialisation</span>
                <span className="font-medium text-foreground">
                  {application.specialisation || "Not specified"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Audit Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">Submitted</span>
                <span>{formatDateTime(application.createdAt)}</span>
                <span className="block text-[11px] text-muted-foreground/75">
                  ({TIMEZONE_LABEL})
                </span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Last Updated</span>
                <span>{formatDateTime(application.updatedAt)}</span>
                <span className="block text-[11px] text-muted-foreground/75">
                  ({TIMEZONE_LABEL})
                </span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Application ID</span>
                <span className="font-mono text-[11px] select-all">{application.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message and Resume Panel */}
        <div className="space-y-6 md:col-span-2">
          {/* Resume Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" /> Resume / CV Document
              </CardTitle>
              <CardDescription>
                Private document stored on the hosting server&apos;s protected disk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasResume ? (
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground truncate max-w-sm">
                          {application.resumeOriginalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.resumeMime} &bull; {formatBytes(application.resumeSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <a
                          href={`/admin/applications/${application.id}/resume`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="text-xs bg-navy hover:bg-navy/90 text-primary-foreground"
                      >
                        <a href={`/admin/applications/${application.id}/resume?download=1`}>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground italic bg-muted/10">
                  No resume document was attached with this application.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Experience &amp; Cover Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.message && application.message.trim() ? (
                <div className="rounded-md border bg-muted/20 p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[140px]">
                  {application.message}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No cover notes provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
