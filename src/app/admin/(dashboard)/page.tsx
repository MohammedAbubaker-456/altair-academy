/**
 * Admin Overview Dashboard Page
 *
 * Displays high-level system statistics, active vs inactive counts for
 * each entity, and quick action links.
 *
 * Location: src/app/admin/(dashboard)/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/server/admin/stats";
import { requireAdmin } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  FolderTree,
  Users,
  Newspaper,
  HelpCircle,
  Quote,
  Briefcase,
  PhoneCall,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  FileUser,
  MailCheck,
  CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | Altair Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const entityCards = [
    {
      title: "Courses",
      stats: stats.courses,
      icon: GraduationCap,
      href: "/admin/courses",
      newHref: "/admin/courses/new",
      description: "Manage technical training courses and certifications",
    },
    {
      title: "Categories",
      stats: stats.categories,
      icon: FolderTree,
      href: "/admin/categories",
      newHref: null,
      description: "Organize courses into technical disciplines",
    },
    {
      title: "Training Calendar",
      stats: {
        total: stats.calendar.sessionsTotal,
        active: stats.calendar.upcomingActiveSessions,
        inactive: stats.calendar.coursesActive,
      },
      totalLabel: "Sessions",
      activeLabel: "Upcoming Active",
      inactiveLabel: "Courses Active",
      icon: CalendarDays,
      href: "/admin/calendar",
      newHref: "/admin/calendar/sessions/new",
      description: "Intake schedules, session dates, and calendar course codes",
    },
    {
      title: "Team & Instructors",
      stats: stats.team,
      icon: Users,
      href: "/admin/team",
      newHref: "/admin/team/new",
      description: "Management profiles, instructors, and credentials",
    },
    {
      title: "News & Insights",
      stats: stats.news,
      icon: Newspaper,
      href: "/admin/news",
      newHref: "/admin/news/new",
      description: "Featured articles, stories, and editor picks",
    },
    {
      title: "FAQs",
      stats: stats.faqs,
      icon: HelpCircle,
      href: "/admin/faqs",
      newHref: null,
      description: "Frequently asked questions for prospective students",
    },
    {
      title: "Testimonials",
      stats: stats.testimonials,
      icon: Quote,
      href: "/admin/testimonials",
      newHref: null,
      description: "Student and employer reviews for the public reel",
    },
    {
      title: "Careers",
      stats: stats.careers,
      icon: Briefcase,
      href: "/admin/careers",
      newHref: "/admin/careers/new",
      description: "Job openings and instructor opportunities",
    },
    {
      title: "Contact Details",
      stats: stats.contact,
      icon: PhoneCall,
      href: "/admin/contact",
      newHref: null,
      description: "Phone numbers, emails, addresses, hours, and social media",
    },
    {
      title: "Legal Pages",
      stats: stats.legal,
      icon: FileText,
      href: "/admin/legal",
      newHref: "/admin/legal/new",
      description: "Privacy policy, terms of service, and custom legal pages",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">
            Welcome back, {admin.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of content, active items, and quick management links for Altair Academy.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Database &amp; Session Secure</span>
        </div>
      </div>

      {/* Inbox & Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
              Inbox &amp; Submissions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live inquiries and recruitment applications requiring administrator attention.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Leads Overview Card */}
          <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  {stats.leads.new > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {stats.leads.new} NEW
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      0 New
                    </span>
                  )}
                  <div className="text-right ml-2">
                    <span className="text-2xl font-bold font-display text-foreground">
                      {stats.leads.total}
                    </span>
                    <span className="text-xs text-muted-foreground block">Total Leads</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg font-display mt-2">Contact Leads</CardTitle>
              <p className="text-xs text-muted-foreground">
                Inquiries and consultation requests submitted via the public contact form
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground font-semibold">{stats.leads.new}</strong>{" "}
                  awaiting response
                </span>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/admin/leads">
                    View Leads <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Overview Card */}
          <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <FileUser className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  {stats.applications.new > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {stats.applications.new} NEW
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      0 New
                    </span>
                  )}
                  <div className="text-right ml-2">
                    <span className="text-2xl font-bold font-display text-foreground">
                      {stats.applications.total}
                    </span>
                    <span className="text-xs text-muted-foreground block">Total Applications</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg font-display mt-2">Career Applications</CardTitle>
              <p className="text-xs text-muted-foreground">
                Instructor &amp; staff candidate submissions with uploaded CVs
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground font-semibold">
                    {stats.applications.new}
                  </strong>{" "}
                  pending initial review
                </span>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/admin/applications">
                    View Applications <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Subscribers Overview Card */}
          <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <MailCheck className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    {stats.subscribers.active} ACTIVE
                  </span>
                  <div className="text-right ml-2">
                    <span className="text-2xl font-bold font-display text-foreground">
                      {stats.subscribers.total}
                    </span>
                    <span className="text-xs text-muted-foreground block">Total Subscribers</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg font-display mt-2">Newsletter Subscribers</CardTitle>
              <p className="text-xs text-muted-foreground">
                Email subscribers registered via the public footer newsletter form
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground font-semibold">
                    {stats.subscribers.active}
                  </strong>{" "}
                  active subscribers
                </span>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/admin/subscribers">
                    View Subscribers <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
            Content Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Published catalog, instructors, updates, and configuration entities.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entityCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-display text-foreground">
                        {card.stats.total}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {card.totalLabel ?? "Total"}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-display mt-2">{card.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 py-2 text-xs border-y my-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">{card.stats.active}</span>
                      <span className="text-muted-foreground">{card.activeLabel ?? "Active"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-medium text-foreground">{card.stats.inactive}</span>
                      <span className="text-muted-foreground">
                        {card.inactiveLabel ?? "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href={card.href}>
                        Manage <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Link>
                    </Button>
                    {card.newHref && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs text-navy hover:text-navy hover:bg-navy/10"
                      >
                        <Link href={card.newHref}>
                          <Plus className="mr-1 h-3 w-3" /> Add New
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
