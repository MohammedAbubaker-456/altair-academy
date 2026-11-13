/**
 * System Health Check API Endpoint
 *
 * Provides a lightweight uptime probe for monitoring systems and GoDaddy cPanel
 * deployments. Pings MariaDB / MySQL and returns HTTP 200 { ok: true } or 503 { ok: false }
 * without exposing internal infrastructure details.
 *
 * Location: src/app/api/health/route.ts
 * Type: Route Handler (Server-Side)
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Execute low-overhead ping query against MariaDB / MySQL
    await db.$queryRawUnsafe("SELECT 1");

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch {
    // Return generic 503 without leaking stack traces or internal connection details
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
