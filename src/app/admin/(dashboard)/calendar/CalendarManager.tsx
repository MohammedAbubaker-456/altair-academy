/**
 * Admin Calendar Manager Root Component
 *
 * Provides tabbed navigation between Scheduled Sessions management
 * and Calendar Course Codes configuration.
 *
 * Location: src/app/admin/(dashboard)/calendar/CalendarManager.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarSessionsTab, type SessionTableRow } from "./CalendarSessionsTab";
import { CalendarCoursesTab, type CourseWithSessionCount } from "./CalendarCoursesTab";
import { CalendarDays, BookOpen } from "lucide-react";

interface CalendarManagerProps {
  sessions: {
    items: SessionTableRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    availableYears: number[];
    defaultYear: number | "ALL";
  };
  courses: CourseWithSessionCount[];
  initialTab?: "sessions" | "courses";
}

export function CalendarManager({
  sessions,
  courses,
  initialTab = "sessions",
}: CalendarManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") ?? initialTab;

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    // If switching to courses tab, remove session-specific page and filters for cleanliness
    if (newTab === "courses") {
      params.delete("page");
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
          Training Calendar Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Administer Level 2 course intake schedules, exam dates, and offered method codes.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="sessions" className="gap-2 text-xs font-semibold">
            <CalendarDays className="h-4 w-4" />
            Scheduled Sessions ({sessions.total})
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2 text-xs font-semibold">
            <BookOpen className="h-4 w-4" />
            Course Codes ({courses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6 outline-none">
          <CalendarSessionsTab
            items={sessions.items}
            total={sessions.total}
            page={sessions.page}
            pageSize={sessions.pageSize}
            totalPages={sessions.totalPages}
            availableYears={sessions.availableYears}
            defaultYear={sessions.defaultYear}
            courses={courses.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 outline-none">
          <CalendarCoursesTab courses={courses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
