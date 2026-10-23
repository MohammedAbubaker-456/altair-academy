/**
 * On-Demand Cache Revalidation Helper
 *
 * Triggers Next.js App Router on-demand cache revalidation when admin mutations occur.
 *
 * Location: src/server/revalidate.ts
 * Type: Server-Only Module
 */

import "server-only";
import { revalidatePath } from "next/cache";

export function revalidatePublicData() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    // revalidatePath might throw during test or non-request contexts
    console.warn("Revalidation notice:", error);
  }
}
