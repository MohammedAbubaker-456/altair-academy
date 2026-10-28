/**
 * Admin Newsletter Subscribers Dashboard Page
 *
 * Displays all newsletter email subscriptions with summary metrics,
 * keyword search, status filtering (ALL, ACTIVE, UNSUBSCRIBED),
 * and direct streaming CSV export.
 *
 * Location: src/app/admin/(dashboard)/subscribers/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { getSubscribersAdmin, getSubscriberSummaryStats } from "@/server/admin/subscribers";
import { SubscribersTable } from "./SubscribersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, Users, UserX, Clock } from "lucide-react";
import type { SubscriberStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter Subscribers | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminSubscribersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminSubscribersPage({ searchParams }: AdminSubscribersPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const status = resolvedParams.status as SubscriberStatus | "ALL" | undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const [stats, { items, total, totalPages, pageSize }] = await Promise.all([
    getSubscriberSummaryStats(),
    getSubscribersAdmin({
      q,
      status: status || "ALL",
      page: isNaN(page) ? 1 : page,
      pageSize: 15,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage public website email subscriptions, export subscriber lists, and monitor audience
            growth.
          </p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Subscribers
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">All registered email records</p>
          </CardContent>
        </Card>

        {/* Active Subscribers */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Subscribers
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MailCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-emerald-700">{stats.active}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Receiving newsletter updates</p>
          </CardContent>
        </Card>

        {/* Unsubscribed */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Unsubscribed
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <UserX className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-muted-foreground">
              {stats.unsubscribed}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Opted out via unsubscribe link</p>
          </CardContent>
        </Card>

        {/* New in Last 30 Days */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              New (Last 30 Days)
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-foreground">
              {stats.newLast30Days}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Recent audience acquisition</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table Component */}
      <SubscribersTable
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
