/**
 * Local Disk Image Storage Service
 *
 * Implements server-side disk storage for uploaded images, replacing third-party
 * cloud storage. Enforces magic-byte verification, random UUID naming, path-traversal
 * guards, and safe entity-based folder layout on the hosting server's persistent disk.
 *
 * Location: src/lib/storage.ts
 * Type: Server-Only Module
 */

import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

export interface StorageService {
  uploadImage(fileBuffer: Buffer, folder: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

/**
 * Validates binary magic bytes to guarantee file authenticity regardless of user-supplied MIME type
 */
export function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  // WEBP (RIFF .... WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

export class LocalDiskStorageService implements StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(env.UPLOAD_DIR);
  }

  /**
   * Persists an image buffer to disk in the specified entity subfolder.
   * Generates a random UUID filename to prevent collisions and overwrite attacks.
   */
  async uploadImage(fileBuffer: Buffer, folder = "uploads"): Promise<string> {
    const ext = detectImageExtension(fileBuffer);
    if (!ext) {
      throw new Error(
        "Invalid image signature. Only authentic JPEG, PNG, and WEBP images are supported.",
      );
    }

    // Sanitize subfolder to prevent directory traversal
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const targetDir = path.resolve(this.baseDir, sanitizedFolder);

    // Verify targetDir is strictly within baseDir
    if (!targetDir.startsWith(this.baseDir)) {
      throw new Error("Invalid destination folder.");
    }

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Generate safe cryptographically random filename
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(targetDir, filename);

    await fs.writeFile(filePath, fileBuffer);

    return `/uploads/${sanitizedFolder}/${filename}`;
  }

  /**
   * Removes an uploaded image from disk.
   * Only deletes files residing under /uploads/ (seed files are never deleted).
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
      // Ignore null, seed files (/seed/...) or external URLs
      return;
    }

    try {
      const relativePath = imageUrl.slice("/uploads/".length);
      const targetFile = path.resolve(this.baseDir, relativePath);

      // Guard strictly against directory traversal
      if (!targetFile.startsWith(this.baseDir)) {
        return;
      }

      await fs.unlink(targetFile);
    } catch {
      // Best-effort deletion (e.g. if file was already removed)
    }
  }
}

export const storageService = new LocalDiskStorageService();
