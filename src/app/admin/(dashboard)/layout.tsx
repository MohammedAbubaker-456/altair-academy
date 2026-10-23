/**
 * Protected Admin Dashboard Layout
 *
 * Enforces server-side authentication verification via requireAdmin()
 * and renders the administrative chrome including sidebar, top header,
 * and responsive content container.
 *
 * Location: src/app/admin/(dashboard)/layout.tsx
 * Type: Server Component Layout
 */

import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 shrink-0">
        <div className="fixed top-0 bottom-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader adminName={admin.name} adminEmail={admin.email} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
