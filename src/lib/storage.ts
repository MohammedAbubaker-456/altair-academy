/**
 * Cloudinary Image Storage Service
 *
 * Implements server-side Cloudinary upload and deletion operations
 * using private credentials validated from env.
 *
 * Location: src/lib/storage.ts
 * Type: Server-Only Module
 */

import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface StorageService {
  uploadImage(fileBuffer: Buffer, folder: string, filename?: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

export class CloudinaryStorageService implements StorageService {
  async uploadImage(fileBuffer: Buffer, folder: string, filename?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder: `altair-academy/${folder}`,
        resource_type: "image",
      };
      if (filename) {
        uploadOptions["public_id"] = filename;
      }

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result.secure_url);
        }
      });

      stream.end(fileBuffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) {
      // Local seed images or external links are ignored
      return;
    }

    try {
      // Extract public_id from Cloudinary URL
      const parts = imageUrl.split("/upload/");
      const afterUpload = parts[1];
      if (!afterUpload) return;
      // Strip version (e.g., v1234567890/)
      const versionStripped = afterUpload.replace(/^v\d+\//, "");
      // Strip file extension
      const publicId =
        versionStripped.substring(0, versionStripped.lastIndexOf(".")) || versionStripped;

      await cloudinary.uploader.destroy(publicId);
    } catch {
      // Best-effort deletion
    }
  }
}

export const storageService = new CloudinaryStorageService();
