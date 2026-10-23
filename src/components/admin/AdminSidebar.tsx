/**
 * Admin Dashboard Sidebar Navigation
 *
 * Renders the primary navigation links with active state styling,
 * brand badges, and links to public frontend.
 *
 * Location: src/components/admin/AdminSidebar.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  FolderTree,
  Users,
  Newspaper,
  HelpCircle,
  Settings,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  onItemClick?: (() => void) | undefined;
  className?: string | undefined;
}

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/team", label: "Team & Instructors", icon: Users },
  { href: "/admin/news", label: "News & Insights", icon: Newspaper },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ onItemClick, className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r border-border bg-card p-4",
        className,
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-primary-foreground font-display font-black text-lg shadow-sm">
            A
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-tight text-foreground block">
              Altair Academy
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            const clickProps = onItemClick ? { onClick: onItemClick } : {};

            return (
              <Link
                key={item.href}
                href={item.href}
                {...clickProps}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* External Public Site link */}
      <div className="border-t border-border pt-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
