/**
 * Edge Middleware for Optimistic Route Protection
 *
 * Intercepts requests to /admin/* and performs fast optimistic redirects
 * to /admin/login if the session cookie is absent.
 * Note: Real cryptographic verification and authorization is enforced in
 * the admin layout and inside every Server Action via requireAdmin().
 *
 * Location: src/middleware.ts
 * Type: Next.js Edge Middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login route and static files
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
