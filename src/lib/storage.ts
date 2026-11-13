/**
 * Local Disk Image Storage Service
 *
 * Implements server-side disk storage for uploaded images.
 * Preserves original filenames, enforces magic-byte verification,
 * prevents filename collisions, and protects against path traversal.
 *
 * Location: src/lib/storage.ts
 * Type: Server-Only Module
 */

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

export interface StorageService {
  uploadImage(fileBuffer: Buffer, folder: string, originalFileName?: string): Promise<string>;

  deleteImage(imageUrl: string): Promise<void>;
}

/**
 * Validates binary magic bytes to guarantee file authenticity.
 */
export function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG
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

  // WEBP
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

/**
 * Creates a safe filename while preserving the original name.
 */
function sanitizeFileName(
  originalFileName: string,
  detectedExtension: "jpg" | "png" | "webp",
): string {
  // Remove any directory information supplied in the filename.
  const safeInput = path.basename(originalFileName.replace(/\\/g, "/"));

  const parsed = path.parse(safeInput);

  // Sanitize the filename without changing its meaningful name.
  let name = parsed.name
    // eslint-disable-next-line no-control-regex -- intentionally strips control characters from file names
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/^\.+/, "")
    .trim()
    .replace(/[. ]+$/, "")
    .slice(0, 120);

  if (!name) {
    name = "image";
  }

  // Preserve .jpeg when the detected content is JPEG.
  const originalExtension = parsed.ext.toLowerCase();

  const extension =
    detectedExtension === "jpg" && originalExtension === ".jpeg" ? "jpeg" : detectedExtension;

  return `${name}.${extension}`;
}

export class LocalDiskStorageService implements StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(env.UPLOAD_DIR);
  }

  /**
   * Saves an image using its original filename.
   * Automatically adds a numeric suffix when a filename already exists.
   */
  async uploadImage(
    fileBuffer: Buffer,
    folder = "uploads",
    originalFileName = "",
  ): Promise<string> {
    const ext = detectImageExtension(fileBuffer);

    if (!ext) {
      throw new Error(
        "Invalid image signature. Only authentic JPEG, PNG, and WEBP images are supported.",
      );
    }

    // Sanitize subfolder to prevent directory traversal.
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const targetDir = path.resolve(this.baseDir, sanitizedFolder);

    // Verify targetDir is strictly within baseDir.
    const relativeDir = path.relative(this.baseDir, targetDir);

    if (relativeDir.startsWith("..") || path.isAbsolute(relativeDir)) {
      throw new Error("Invalid destination folder.");
    }

    // Ensure directory exists.
    await fs.mkdir(targetDir, { recursive: true });

    // Generate the original filename with a verified extension.
    const safeFileName = sanitizeFileName(originalFileName || `image.${ext}`, ext);

    const parsed = path.parse(safeFileName);

    let filename = safeFileName;
    let counter = 1;

    // Avoid overwriting files with duplicate names.
    while (true) {
      const filePath = path.join(targetDir, filename);

      try {
        await fs.writeFile(filePath, fileBuffer, {
          flag: "wx",
        });

        break;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
          throw err;
        }

        filename = `${parsed.name}-${counter}${parsed.ext}`;
        counter++;
      }
    }

    return `/uploads/${sanitizedFolder}/${encodeURIComponent(filename)}`;
  }

  /**
   * Removes an uploaded image from disk.
   * Only deletes files residing under /uploads/.
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
      return;
    }

    try {
      const relativePath = decodeURIComponent(imageUrl.slice("/uploads/".length));

      const targetFile = path.resolve(this.baseDir, relativePath);
      const relativeFile = path.relative(this.baseDir, targetFile);

      // Guard against directory traversal.
      if (relativeFile.startsWith("..") || path.isAbsolute(relativeFile)) {
        return;
      }

      await fs.unlink(targetFile);
    } catch {
      // Best-effort deletion.
    }
  }
}

export const storageService = new LocalDiskStorageService();
