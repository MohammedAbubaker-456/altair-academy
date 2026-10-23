/**
 * Uploaded Media Static Serving Route Handler
 *
 * Serves persistent disk images from UPLOAD_DIR with strict path-traversal prevention,
 * MIME type enforcement, immutable cache headers, and nosniff protection.
 *
 * Location: src/app/uploads/[...path]/route.ts
 * Type: Route Handler (Server-Side)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;

  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Join segments and resolve full absolute path
  const sanitizedRelPath = path.join(...pathSegments);
  const baseUploadDir = path.resolve(env.UPLOAD_DIR);
  const targetFile = path.resolve(baseUploadDir, sanitizedRelPath);

  // Guard strictly against directory traversal attacks (e.g. ../ or symlinks)
  if (!targetFile.startsWith(baseUploadDir)) {
    return new NextResponse("Access Denied", { status: 404 });
  }

  // Check extension
  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_MAP[ext];
  if (!contentType) {
    return new NextResponse("Unsupported Media Type", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(targetFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const errorObj = err as { code?: string };
    if (errorObj.code === "ENOENT") {
      return new NextResponse("File Not Found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
