/**
 * Environment Variables Validation Module
 *
 * Validates all required server-side environment variables at runtime using Zod.
 * Enforces security constraints like minimum length for JWT secrets.
 *
 * Location: src/lib/env.ts
 * Type: Server-Only Module
 */

import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long for secure JWT signing"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters long").optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error(
      "Invalid environment variables. Please check your .env file against .env.example",
    );
  }
  return result.data;
}

export const env = validateEnv();
