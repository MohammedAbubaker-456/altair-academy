/**
 * Admin Authentication Server Actions
 *
 * Handles admin login and logout with rate-limiting, timing equalization,
 * and session cookie creation.
 *
 * Location: src/app/admin/login/actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";
import {
  checkLoginThrottle,
  recordFailedLogin,
  clearLoginThrottle,
} from "@/lib/auth/throttle";
import { createSession, destroySession } from "@/lib/auth/session";

// Pre-computed dummy bcrypt hash to equalize timing on failed email lookups
const DUMMY_HASH = "$2a$12$e8uq0wE/WqXw0E2H9xP1xO04p04w1sA.x2f91qU71/2m6a.6kK24O";

export type LoginActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function loginAdminAction(formData: unknown): Promise<LoginActionResult> {
  const parseResult = loginSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Invalid form submission",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { password } = parseResult.data;
  const email = parseResult.data.email.toLowerCase().trim();

  // Extract client IP address from headers
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "127.0.0.1";

  // Check login throttle (max 5 failed attempts per 15 min)
  const throttleStatus = await checkLoginThrottle(email, ip);
  if (!throttleStatus.allowed) {
    return {
      ok: false,
      message: `Too many failed attempts. Please retry after ${throttleStatus.retryAfterMinutes} minute(s).`,
    };
  }

  // Look up user
  const admin = await db.adminUser.findUnique({
    where: { email },
  });

  // Always run bcrypt.compare to neutralize timing attacks
  const hashToCompare = admin ? admin.passwordHash : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!admin || !isMatch) {
    await recordFailedLogin(email, ip);
    return {
      ok: false,
      message: "Invalid email or password",
    };
  }

  // Clear failed throttle record upon success
  await clearLoginThrottle(email, ip);

  // Set 8-hour session cookie
  await createSession(admin.id, admin.email, admin.name);

  return { ok: true };
}

export async function logoutAdminAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
