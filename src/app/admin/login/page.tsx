/**
 * Admin Login Page
 *
 * Provides authentication interface for the Altair Academy management dashboard.
 * If an admin is already authenticated, redirects directly to /admin.
 *
 * Location: src/app/admin/login/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Altair Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const admin = await getAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-primary-foreground font-display font-black text-xl shadow-md">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Altair Academy Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access the management portal
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
