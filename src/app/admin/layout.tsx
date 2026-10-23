/**
 * Root Admin Layout
 *
 * Provides base wrapper for all /admin routes, sets robots noindex/nofollow,
 * and mounts the Sonner toast notification provider.
 *
 * Location: src/app/admin/layout.tsx
 * Type: Server Component Layout
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 font-sans text-foreground antialiased">
      {children}
      <Toaster position="top-right" richColors />
    </div>
  );
}
