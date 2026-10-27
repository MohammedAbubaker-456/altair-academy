/**
 * Public Submission Rate Limiting Module
 *
 * Implements privacy-preserving rate limiting for public forms (leads & job applications).
 * Keyed by an HMAC-SHA256 hash of the client's IP address with AUTH_SECRET so raw IP addresses
 * are never stored in the database.
 * Reuses the LoginAttempt collection with scope prefixes ("lead", "application").
 *
 * Location: src/lib/rate-limit.ts
 * Type: Server-Only Module
 */

import "server-only";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export type RateLimitScope = "lead" | "application";

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterMinutes: number; message: string };

const LIMITS: Record<RateLimitScope, { max: number; windowMs: number; label: string }> = {
  lead: {
    max: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    label: "enquiries",
  },
  application: {
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    label: "applications",
  },
};

/**
 * Derives a privacy-preserving, cryptographically hashed client identifier
 * using HMAC-SHA256 with AUTH_SECRET. Raw IP addresses are never persisted.
 */
export async function getClientHash(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
    const rawIp = forwarded ? forwarded.split(",")[0]?.trim() || "127.0.0.1" : "127.0.0.1";
    return crypto.createHmac("sha256", env.AUTH_SECRET).update(rawIp).digest("hex");
  } catch {
    return crypto.createHmac("sha256", env.AUTH_SECRET).update("fallback-client").digest("hex");
  }
}

/**
 * Checks if the client has exceeded the submission rate limit for the given scope.
 */
export async function checkRateLimit(scope: RateLimitScope): Promise<RateLimitResult> {
  const clientHash = await getClientHash();
  const key = `${scope}_${clientHash}`;
  const config = LIMITS[scope];
  const now = new Date();

  const record = await db.loginAttempt.findUnique({
    where: { key },
  });

  if (!record) {
    return { allowed: true };
  }

  const windowAge = now.getTime() - record.windowStart.getTime();

  // If the window has expired, clear the expired counter
  if (windowAge > config.windowMs) {
    await db.loginAttempt.deleteMany({ where: { key } }).catch(() => {});
    return { allowed: true };
  }

  if (record.count >= config.max) {
    const remainingMs = config.windowMs - windowAge;
    const retryAfterMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
    return {
      allowed: false,
      retryAfterMinutes,
      message: `Too many ${config.label} submitted. Please wait ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"} before trying again.`,
    };
  }

  return { allowed: true };
}

/**
 * Records a submission attempt for the client.
 */
export async function recordRateLimitAttempt(scope: RateLimitScope): Promise<void> {
  const clientHash = await getClientHash();
  const key = `${scope}_${clientHash}`;
  const config = LIMITS[scope];
  const now = new Date();

  const record = await db.loginAttempt.findUnique({ where: { key } });

  if (!record || now.getTime() - record.windowStart.getTime() > config.windowMs) {
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
