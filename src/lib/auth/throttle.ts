/**
 * Login Attempt Throttling Module
 *
 * Enforces rate limiting on login attempts to mitigate brute-force password guessing.
 * Allows maximum 5 failed attempts per 15-minute window per email + IP address.
 *
 * Location: src/lib/auth/throttle.ts
 * Type: Server-Only Module
 */

import "server-only";
import { db } from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export type ThrottleResult = { allowed: true } | { allowed: false; retryAfterMinutes: number };

/**
 * Checks if the given email and IP address are currently rate-limited.
 */
export async function checkLoginThrottle(email: string, ip: string): Promise<ThrottleResult> {
  const key = `${email.toLowerCase().trim()}_${ip.trim()}`;
  const now = new Date();

  const record = await db.loginAttempt.findUnique({
    where: { key },
  });

  if (!record) {
    return { allowed: true };
  }

  const windowAge = now.getTime() - record.windowStart.getTime();

  // If window expired, reset
  if (windowAge > WINDOW_DURATION_MS) {
    await db.loginAttempt.delete({ where: { key } }).catch(() => {});
    return { allowed: true };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const remainingMs = WINDOW_DURATION_MS - windowAge;
    const retryAfterMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
    return { allowed: false, retryAfterMinutes };
  }

  return { allowed: true };
}

/**
 * Records a failed login attempt for the given email and IP address.
 */
export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  const key = `${email.toLowerCase().trim()}_${ip.trim()}`;
  const now = new Date();

  const record = await db.loginAttempt.findUnique({ where: { key } });

  if (!record || now.getTime() - record.windowStart.getTime() > WINDOW_DURATION_MS) {
    await db.loginAttempt.upsert({
      where: { key },
      update: { count: 1, windowStart: now },
      create: { key, count: 1, windowStart: now },
    });
  } else {
    await db.loginAttempt.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  }
}

/**
 * Clears failed login attempts after a successful login.
 */
export async function clearLoginThrottle(email: string, ip: string): Promise<void> {
  const key = `${email.toLowerCase().trim()}_${ip.trim()}`;
  await db.loginAttempt.delete({ where: { key } }).catch(() => {});
}
