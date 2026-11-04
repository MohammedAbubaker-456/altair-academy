/**
 * Admin Image Upload Server Action
 *
 * Validates admin session, verifies file MIME type and file size (max 5MB),
 * and persists the image to the local disk storage service.
 *
 * Location: src/app/admin/upload-actions.ts
 * Type: Server Actions ("use server")
 */

// "use server";

// import { verifyAdminAction } from "@/lib/auth/session";
// import { storageService } from "@/lib/storage";

// const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
// const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// export type UploadActionResult =
//   { ok: true; url: string } | { ok: false; message: string; authError?: boolean };

// export async function uploadImageAction(
//   formData: FormData,
//   folder = "uploads",
// ): Promise<UploadActionResult> {
//   const auth = await verifyAdminAction();
//   if (!auth.ok) return auth;

//   const file = formData.get("file");
//   if (!file || !(file instanceof File)) {
//     return { ok: false, message: "No file provided" };
//   }

//   if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//     return {
//       ok: false,
//       message: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP`,
//     };
//   }

//   if (file.size > MAX_FILE_SIZE_BYTES) {
//     return {
//       ok: false,
//       message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
//     };
//   }

//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const url = await storageService.uploadImage(buffer, folder);
//     return { ok: true, url };
//   } catch (err) {
//     console.error("[uploadImageAction] Storage error:", err);
//     return {
//       ok: false,
//       message: err instanceof Error ? err.message : "Image upload failed",
//     };
//   }
// }


/**
 * Admin Image Upload Server Action
 *
 * Validates admin session, verifies file MIME type and file size (max 5MB),
 * and persists the image to the local disk storage service using its original filename.
 *
 * Location: src/app/admin/upload-actions.ts
 * Type: Server Actions ("use server")
 */

"use server";

import { verifyAdminAction } from "@/lib/auth/session";
import { storageService } from "@/lib/storage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadActionResult =
  | { ok: true; url: string }
  | { ok: false; message: string; authError?: boolean };

export async function uploadImageAction(
  formData: FormData,
  folder = "uploads",
): Promise<UploadActionResult> {
  const auth = await verifyAdminAction();
  if (!auth.ok) return auth;

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return { ok: false, message: "No file provided" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Pass the original uploaded filename to the storage service.
    const url = await storageService.uploadImage(
      buffer,
      folder,
      file.name,
    );

    return { ok: true, url };
  } catch (err) {
    console.error("[uploadImageAction] Storage error:", err);

    return {
      ok: false,
      message: err instanceof Error ? err.message : "Image upload failed",
    };
  }
}
