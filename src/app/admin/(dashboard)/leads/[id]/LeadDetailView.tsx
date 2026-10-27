/**
 * Admin Lead Detail View Component
 *
 * Client Component for inspecting a specific lead's full inquiry details.
 * Supports optimistic status updates, quick email and phone dialer actions,
 * and deletion with confirmation.
 *
 * Location: src/app/admin/(dashboard)/leads/[id]/LeadDetailView.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleAdminActionResult } from "@/lib/admin-client";
import { setLeadStatusAction, deleteLeadAction } from "@/app/admin/leads/actions";
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
  Calendar,
  Clock,
  User,
  MessageSquare,
  Globe,
} from "lucide-react";
import type { LeadStatus } from "@prisma/client";

interface LeadData {
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

interface LeadDetailViewProps {
  lead: LeadData;
}

export function LeadDetailView({ lead }: LeadDetailViewProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<LeadStatus>(lead.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    const previous = status;
    setStatus(newStatus);
    setIsUpdatingStatus(true);

    try {
      const result = await setLeadStatusAction(lead.id, newStatus);
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
      const result = await deleteLeadAction(lead.id);
      handleAdminActionResult(result, () => {
        router.push("/admin/leads");
        router.refresh();
      });
    } catch {
      toast.error("Failed to delete lead enquiry");
    }
  };

  const cleanPhone = lead.phone.replace(/[\s\-()]/g, "");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Navigation and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/leads">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
                {lead.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enquiry received on {formatDateTime(lead.createdAt)} ({TIMEZONE_LABEL})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="w-[140px]">
            <Select
              value={status}
              onValueChange={(val) => handleStatusChange(val as LeadStatus)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                <SelectItem value="CLOSED">CLOSED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Quick Action */}
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={`mailto:${lead.email}?subject=Altair%20Academy%20Course%20Enquiry`}>
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
            title="Delete Lead Enquiry"
            description={`Are you sure you want to permanently delete the lead from "${lead.name}"? This cannot be undone.`}
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
                <User className="h-4 w-4 text-primary" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium text-foreground">{lead.name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <a
                  href={`mailto:${lead.email}`}
                  className="font-medium text-brand-red hover:underline break-all"
                >
                  {lead.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone Number</span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-mono text-sm text-foreground hover:underline"
                >
                  {lead.phone}
                </a>
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
                <span>{formatDateTime(lead.createdAt)}</span>
                <span className="block text-[11px] text-muted-foreground/75">
                  ({TIMEZONE_LABEL})
                </span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Last Updated</span>
                <span>{formatDateTime(lead.updatedAt)}</span>
                <span className="block text-[11px] text-muted-foreground/75">
                  ({TIMEZONE_LABEL})
                </span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Source Channel</span>
                <span className="font-mono">{lead.source}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Lead ID</span>
                <span className="font-mono text-[11px] select-all">{lead.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Content */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Enquiry Message
              </CardTitle>
              <CardDescription>
                Submitted message as entered by the student or prospective client.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="rounded-md border bg-muted/20 p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px]">
                {lead.message}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
