/**
 * Admin Private Resume Download / View Route Handler
 *
 * Securely serves private resumes to authenticated administrators only.
 * Enforces session verification (returning 401 on missing session), nosniff protection,
 * non-cacheable private headers, and inline vs attachment Content-Disposition.
 *
 * Location: src/app/admin/applications/[id]/resume/route.ts
 * Type: Route Handler (Server-Side)
 */

import fs from "node:fs/promises";
import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getResumeFilePath } from "@/lib/private-storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Enforce admin authentication (401 for no session)
  const admin = await getAdmin();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // 2. Validate MongoDB ObjectId
  if (!/^[a-f0-9]{24}$/.test(id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 3. Load application record
  const application = await db.careerApplication.findUnique({
    where: { id },
    select: {
      id: true,
      resumeOriginalName: true,
      resumeStoredName: true,
      resumeMime: true,
    },
  });

  if (!application || !application.resumeStoredName) {
    return new NextResponse("Resume Not Found", { status: 404 });
  }

  // 4. Resolve verified path inside PRIVATE_UPLOAD_DIR
  const filePath = getResumeFilePath(application.resumeStoredName);
  if (!filePath) {
    return new NextResponse("Resume Not Found", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);

    // 5. Build Content-Disposition: inline for PDF unless ?download=1, attachment for DOC/DOCX
    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const isPdf = application.resumeStoredName.toLowerCase().endsWith(".pdf");
    const dispositionType = isDownload || !isPdf ? "attachment" : "inline";

    const rawFilename = application.resumeOriginalName || "resume.pdf";
    const safeFilename = rawFilename.replace(/[^a-zA-Z0-9_.-]/g, "_");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": application.resumeMime || "application/octet-stream",
        "Content-Disposition": `${dispositionType}; filename="${safeFilename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: unknown) {
    const errorObj = err as { code?: string };
    if (errorObj.code === "ENOENT") {
      return new NextResponse("Resume File Not Found", { status: 404 });
    }
    console.error("[GET /admin/applications/:id/resume] Error reading file:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
