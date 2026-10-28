/**
 * Admin Newsletter Subscribers CSV Export Route Handler
 *
 * Streams subscriber records as RFC 4180 compliant CSV with UTF-8 BOM,
 * CRLF line endings, double-quoted fields, cursor-based batching for low memory,
 * and formula injection protection against spreadsheet execution attacks.
 *
 * Location: src/app/admin/subscribers/export/route.ts
 * Type: Route Handler (Server-Side)
 */

import { type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { Prisma, NewsletterSubscriber } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * Escapes and sanitizes a cell value for RFC 4180 CSV export with formula injection defense.
 * If value starts with =, +, -, @, tab (\t), or carriage return (\r), prefixes with single quote.
 */
function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);

  // CSV / Spreadsheet formula injection protection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Double up embedded double-quotes (RFC 4180)
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: NextRequest): Promise<Response> {
  // 1. Enforce admin authentication (401 with no body details when unauthenticated)
  const admin = await getAdmin();
  if (!admin) {
    return new Response(null, { status: 401 });
  }

  // 2. Validate scope query parameter (?scope=active | ?scope=all)
  const scopeParam = request.nextUrl.searchParams.get("scope")?.toLowerCase();
  const scope = scopeParam === "all" ? "all" : "active";

  const where: Prisma.NewsletterSubscriberWhereInput =
    scope === "active" ? { status: "ACTIVE" } : {};

  // 3. Generate filename with date in admin timezone (Asia/Kuala_Lumpur)
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = dateFormatter.format(new Date());
  const filename = `newsletter-subscribers-${dateStr}.csv`;

  // 4. Stream response using ReadableStream to prevent loading large tables into RAM
  const encoder = new TextEncoder();
  const HEADER_ROW =
    '"email","status","source","subscribed_at","unsubscribed_at","unsubscribe_token"';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Enqueue UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility + header row + CRLF
        controller.enqueue(encoder.encode("\uFEFF" + HEADER_ROW + "\r\n"));

        const BATCH_SIZE = 1000;
        let lastId: string | undefined = undefined;

        while (true) {
          const batch: NewsletterSubscriber[] = await db.newsletterSubscriber.findMany({
            where,
            take: BATCH_SIZE,
            orderBy: [{ subscribedAt: "asc" }, { id: "asc" }],
            ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
          });

          if (batch.length === 0) {
            break;
          }

          let chunk = "";
          for (const sub of batch) {
            const row =
              [
                sanitizeCsvCell(sub.email),
                sanitizeCsvCell(sub.status),
                sanitizeCsvCell(sub.source),
                sanitizeCsvCell(sub.subscribedAt.toISOString()),
                sanitizeCsvCell(sub.unsubscribedAt ? sub.unsubscribedAt.toISOString() : ""),
                sanitizeCsvCell(sub.unsubscribeToken),
              ].join(",") + "\r\n";
            chunk += row;
          }

          controller.enqueue(encoder.encode(chunk));
          const lastItem = batch[batch.length - 1];
          if (lastItem) {
            lastId = lastItem.id;
          }

          if (batch.length < BATCH_SIZE) {
            break;
          }
        }

        controller.close();
      } catch (err) {
        console.error(
          "[GET /admin/subscribers/export] Stream error:",
          err instanceof Error ? err.message : "Export failed",
        );
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
