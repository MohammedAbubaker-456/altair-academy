/**
 * Private Resume Storage Service
 *
 * Implements server-side private disk storage for candidate resume documents.
 * Never exposes documents publicly. Enforces 5 MB file limits, magic-byte inspection
 * for authentic PDF (%PDF-), DOCX (PK\x03\x04), and legacy DOC (D0 CF 11 E0 A1 B1 1A E1),
 * UUID naming, and directory traversal rejection.
 *
 * Location: src/lib/private-storage.ts
 * Type: Server-Only Module
 */

import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export interface SaveResumeResult {
  storedName: string;
  resumeOriginalName: string;
  resumeMime: string;
  resumeSize: number;
}

const DECLARED_MIME_ALLOWLIST = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream", // Frequently sent by some browsers for Word documents
  "application/x-zip-compressed",
  "application/zip",
]);

/**
 * Validates binary magic header bytes to verify authentic document types.
 */
export function detectDocumentType(
  buffer: Buffer,
): { ext: "pdf" | "docx" | "doc"; mime: string } | null {
  if (buffer.length < 5) return null;

  // PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { ext: "pdf", mime: "application/pdf" };
  }

  // DOCX: ZIP archive header PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }

  // DOC: Compound File Binary Format / OLE header (D0 CF 11 E0 A1 B1 1A E1)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  ) {
    return { ext: "doc", mime: "application/msword" };
  }

  return null;
}

/**
 * Sanitizes original filenames for display purposes only.
 */
/* eslint-disable no-control-regex */
export function sanitizeOriginalFilename(rawName: string): string {
  const base = path
    .basename(rawName)
    .replace(/[\x00-\x1F\x7F\\/]/g, "")
    .trim();
  return base.slice(0, 100) || "resume-document";
}
/* eslint-enable no-control-regex */

/**
 * Validates and stores an uploaded resume document into PRIVATE_UPLOAD_DIR/resumes.
 */
export async function saveResume(file: File): Promise<SaveResumeResult> {
  // 1. Validate file size
  if (file.size > MAX_RESUME_SIZE) {
    throw new Error("Resume exceeds the maximum allowable size of 5 MB.");
  }

  if (file.size === 0) {
    throw new Error("Uploaded resume file is empty.");
  }

  // 2. Validate declared file extension
  const originalName = file.name || "resume.pdf";
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_RESUME_EXTENSIONS.includes(ext as (typeof ALLOWED_RESUME_EXTENSIONS)[number])) {
    throw new Error(
      "Invalid file type. Only PDF (.pdf) and Word documents (.doc, .docx) are accepted.",
    );
  }

  // 3. Validate declared MIME type
  if (file.type && !DECLARED_MIME_ALLOWLIST.has(file.type.toLowerCase())) {
    throw new Error("Invalid document MIME type.");
  }

  // 4. Read binary content and inspect magic bytes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detected = detectDocumentType(buffer);
  if (!detected) {
    throw new Error(
      "Invalid file content signature. File appears corrupted or is not an authentic PDF or Word document.",
    );
  }

  // 5. Ensure declared extension matches detected magic byte format
  if (
    (ext === ".pdf" && detected.ext !== "pdf") ||
    (ext === ".docx" && detected.ext !== "docx") ||
    (ext === ".doc" && detected.ext !== "doc")
  ) {
    throw new Error("File extension does not match the file's internal binary signature.");
  }

  // 6. Write to PRIVATE_UPLOAD_DIR/resumes/<uuid>.<ext> with a random name
  const resumesDir = path.resolve(env.PRIVATE_UPLOAD_DIR, "resumes");
  await fs.mkdir(resumesDir, { recursive: true });

  const storedFilename = `${crypto.randomUUID()}.${detected.ext}`;
  const targetFile = path.resolve(resumesDir, storedFilename);

  // Guard strictly against directory traversal
  if (!targetFile.startsWith(resumesDir)) {
    throw new Error("Directory traversal detected.");
  }

  await fs.writeFile(targetFile, buffer);

  return {
    storedName: storedFilename,
    resumeOriginalName: sanitizeOriginalFilename(originalName),
    resumeMime: detected.mime,
    resumeSize: buffer.length,
  };
}

/**
 * Best-effort deletion of a stored resume file with strict traversal verification.
 */
export async function deleteResume(storedName: string | null | undefined): Promise<void> {
  if (!storedName) return;

  // Stored name must match strictly UUID.<ext>
  if (!/^[a-f0-9-]{36}\.(pdf|doc|docx)$/i.test(storedName)) {
    return;
  }

  try {
    const resumesDir = path.resolve(env.PRIVATE_UPLOAD_DIR, "resumes");
    const targetFile = path.resolve(resumesDir, storedName);

    if (!targetFile.startsWith(resumesDir)) {
      return;
    }

    await fs.unlink(targetFile);
  } catch {
    // Best effort - ignore ENOENT
  }
}

/**
 * Resolves verified absolute path for streaming private resume files.
 */
export function getResumeFilePath(storedName: string): string | null {
  if (!/^[a-f0-9-]{36}\.(pdf|doc|docx)$/i.test(storedName)) {
    return null;
  }

  const resumesDir = path.resolve(env.PRIVATE_UPLOAD_DIR, "resumes");
  const targetFile = path.resolve(resumesDir, storedName);

  if (!targetFile.startsWith(resumesDir)) {
    return null;
  }

  return targetFile;
}
