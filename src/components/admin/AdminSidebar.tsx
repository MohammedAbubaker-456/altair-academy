/**
 * Admin Dashboard Sidebar Navigation
 *
 * Renders categorized navigation links (Content & Site Settings),
 * brand badges, active state styling, and public frontend links.
 *
 * Location: src/components/admin/AdminSidebar.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import { overviewNavItem, contentNavItems, siteSettingsNavItems } from "./nav-items";

interface AdminSidebarProps {
  onItemClick?: (() => void) | undefined;
  className?: string | undefined;
}

export function AdminSidebar({ onItemClick, className }: AdminSidebarProps) {
  const pathname = usePathname();

  const isOverviewActive = pathname === "/admin";

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r border-border bg-card p-4 overflow-y-auto",
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

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {/* Overview */}
          <div>
            <Link
              href="/admin"
              {...(onItemClick ? { onClick: onItemClick } : {})}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isOverviewActive
                  ? "bg-navy text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Overview</span>
            </Link>
          </div>

          {/* Content Group */}
          <div>
            <span className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              Content
            </span>
            <div className="mt-1 space-y-1">
              {contentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...(onItemClick ? { onClick: onItemClick } : {})}
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
            </div>
          </div>

          {/* Site Settings Group */}
          <div>
            <span className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              Site Settings
            </span>
            <div className="mt-1 space-y-1">
              {siteSettingsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...(onItemClick ? { onClick: onItemClick } : {})}
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
            </div>
          </div>
        </nav>
      </div>

      {/* External Public Site link */}
      <div className="border-t border-border pt-4 mt-6">
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
