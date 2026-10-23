/**
 * Admin Session Management Module
 *
 * Implements lightweight, secure JWT session management using jose (HS256).
 * Signs session tokens stored in an httpOnly cookie and exposes session helpers.
 *
 * Location: src/lib/auth/session.ts
 * Type: Server-Only Module
 */

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const SESSION_EXPIRATION = "8h";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

export type AdminSessionPayload = {
  adminId: string;
  email: string;
  name: string;
};

function getSecretKey() {
  return new TextEncoder().encode(env.AUTH_SECRET);
}

/**
 * Creates and sets an encrypted admin session cookie.
 */
export async function createSession(adminId: string, email: string, name: string): Promise<void> {
  const secret = getSecretKey();
  const token = await new SignJWT({ adminId, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the admin session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verifies the incoming admin session cookie and returns decoded payload if valid.
 */
export async function verifySession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload["adminId"] === "string" &&
      typeof payload["email"] === "string" &&
      typeof payload["name"] === "string"
    ) {
      return {
        adminId: payload["adminId"],
        email: payload["email"],
        name: payload["name"],
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated admin user from the database.
 * Wrapped in React cache() so multiple components in the same render pass share the query.
 */
export const getAdmin = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const admin = await db.adminUser.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return admin;
  } catch {
    return null;
  }
});

/**
 * Enforces admin authentication.
 * Returns the authenticated admin user or redirects to /admin/login immediately.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
