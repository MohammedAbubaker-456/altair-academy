/**
 * Optimistic Status Switch Component
 *
 * Interactive toggle switch for switching entity statuses between ACTIVE and INACTIVE
 * with optimistic UI updates and toast notifications.
 *
 * Location: src/components/admin/StatusSwitch.tsx
 * Type: Client Component ("use client")
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface StatusSwitchProps {
  id: string;
  initialStatus: "ACTIVE" | "INACTIVE";
  onToggle: (
    id: string,
    newStatus: "ACTIVE" | "INACTIVE",
  ) => Promise<{ ok: boolean; message: string }>;
  disabled?: boolean;
}

export function StatusSwitch({ id, initialStatus, onToggle, disabled = false }: StatusSwitchProps) {
  const [status, setStatus] = React.useState<"ACTIVE" | "INACTIVE">(initialStatus);
  const [isPending, startTransition] = React.useTransition();

  // Sync state if initialStatus changes
  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleCheckedChange = (checked: boolean) => {
    const nextStatus = checked ? "ACTIVE" : "INACTIVE";
    const prevStatus = status;

    // Optimistic update
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        const result = await onToggle(id, nextStatus);
        if (result.ok) {
          toast.success(result.message);
        } else {
          setStatus(prevStatus); // Revert
          if ((result as { authError?: boolean }).authError) {
            toast.error(result.message || "Session expired, please sign in again");
            window.location.href = "/admin/login";
          } else {
            toast.error(result.message || "Failed to update status");
          }
        }
      } catch (err) {
        setStatus(prevStatus); // Revert
        console.error("[StatusSwitch] toggle error:", err);
        toast.error("Failed to update status. Please refresh the page.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={status === "ACTIVE"}
        onCheckedChange={handleCheckedChange}
        disabled={disabled || isPending}
        aria-label="Toggle active status"
      />
      <Badge
        variant={status === "ACTIVE" ? "default" : "secondary"}
        className={
          status === "ACTIVE"
            ? "bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] px-1.5 py-0 font-medium"
            : "text-muted-foreground text-[10px] px-1.5 py-0 font-medium"
        }
      >
        {status}
      </Badge>
    </div>
  );
}
