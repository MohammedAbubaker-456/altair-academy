/**
 * Admin Settings Page
 *
 * Provides administrative account settings and credential management.
 *
 * Location: src/app/admin/(dashboard)/settings/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Settings | Altair Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display text-foreground">
          Admin Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your administrative profile and security credentials.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 text-sm text-card-foreground">
        <p className="font-medium text-foreground">
          Logged in as: <span className="font-semibold text-navy">{admin.name}</span> ({admin.email}
          )
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
