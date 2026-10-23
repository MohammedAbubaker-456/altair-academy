/**
 * Admin Top Navigation Header
 *
 * Displays the current authenticated administrator's credentials,
 * houses mobile sheet sidebar triggers, and provides session sign-out.
 *
 * Location: src/components/admin/AdminHeader.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { logoutAdminAction } from "@/app/admin/login/actions";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, UserCheck } from "lucide-react";

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
}

export function AdminHeader({ adminName, adminEmail }: AdminHeaderProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isLoggingOut, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <AdminSidebar onItemClick={() => setSheetOpen(false)} className="border-r-0" />
          </SheetContent>
        </Sheet>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Altair Management Console
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin User Info */}
        <div className="flex items-center gap-2 text-right">
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-foreground leading-none">{adminName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{adminEmail}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/10 text-navy font-semibold text-xs border border-navy/20">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </header>
  );
}
