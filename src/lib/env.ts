/**
 * Environment Variables Validation Module
 *
 * Validates all required server-side environment variables at runtime using Zod.
 * Enforces production safety rules for MongoDB connection strings and external
 * disk storage directories, preventing media loss on shared hosting deployments.
 *
 * Location: src/lib/env.ts
 * Type: Server-Only Module
 */

import "server-only";
import path from "node:path";
import { z } from "zod";

const isProduction = process.env["NODE_ENV"] === "production";
const isBuildPhase =
  process.env["NEXT_PHASE"] === "phase-production-build" ||
  process.env["npm_lifecycle_event"] === "build" ||
  process.env["NEXT_IS_BUILD"] === "true";

const envSchema = z
  .object({
    DATABASE_URL: z
      .string({ required_error: "DATABASE_URL is required" })
      .min(1, "DATABASE_URL cannot be empty")
      .refine(
        (url) => url.startsWith("mysql://") || url.startsWith("mariadb://"),
        "DATABASE_URL must start with 'mysql://' or 'mariadb://'",
      ),
    AUTH_SECRET: z
      .string({ required_error: "AUTH_SECRET is required" })
      .min(32, "AUTH_SECRET must be at least 32 characters long for secure JWT signing"),
    UPLOAD_DIR: z.string().optional(),
    PRIVATE_UPLOAD_DIR: z.string().optional(),
    SITE_URL: z
      .string()
      .trim()
      .optional()
      .refine((val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }, "SITE_URL must be a valid absolute URL (e.g. 'https://altair.academy')"),
    ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
    ADMIN_PASSWORD: z
      .string()
      .min(8, "ADMIN_PASSWORD must be at least 8 characters long")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const rawUploadDir = data.UPLOAD_DIR?.trim();
    const rawPrivateUploadDir = data.PRIVATE_UPLOAD_DIR?.trim();

    // Enforce production storage constraints during runtime on the server
    if (isProduction && !isBuildPhase) {
      const appRoot = path.resolve(process.cwd());

      // 1. UPLOAD_DIR checks
      if (!rawUploadDir) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["UPLOAD_DIR"],
          message:
            "UPLOAD_DIR is REQUIRED in production. Please set it in your cPanel 'Setup Node.js App' environment table.",
        });
      } else if (!path.isAbsolute(rawUploadDir)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["UPLOAD_DIR"],
          message: `UPLOAD_DIR must be an absolute path (received: "${rawUploadDir}"). Example: /home/<user>/altair-assets/uploads`,
        });
      } else {
        const resolvedUpload = path.resolve(rawUploadDir);
        const relative = path.relative(appRoot, resolvedUpload);
        const isInside =
          resolvedUpload === appRoot || (!relative.startsWith("..") && !path.isAbsolute(relative));

        if (isInside) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["UPLOAD_DIR"],
            message: `UPLOAD_DIR must NOT be inside the application root ("${appRoot}"). Place uploads in an external folder like /home/<user>/altair-assets/uploads`,
          });
        }
      }

      // 2. PRIVATE_UPLOAD_DIR checks
      if (!rawPrivateUploadDir) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["PRIVATE_UPLOAD_DIR"],
          message:
            "PRIVATE_UPLOAD_DIR is REQUIRED in production. Please set it in your cPanel 'Setup Node.js App' environment table.",
        });
      } else if (!path.isAbsolute(rawPrivateUploadDir)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["PRIVATE_UPLOAD_DIR"],
          message: `PRIVATE_UPLOAD_DIR must be an absolute path (received: "${rawPrivateUploadDir}"). Example: /home/<user>/altair-assets/private-uploads`,
        });
      } else {
        const resolvedPrivate = path.resolve(rawPrivateUploadDir);
        const relativePrivate = path.relative(appRoot, resolvedPrivate);
        const isInsidePrivate =
          resolvedPrivate === appRoot ||
          (!relativePrivate.startsWith("..") && !path.isAbsolute(relativePrivate));

        if (isInsidePrivate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["PRIVATE_UPLOAD_DIR"],
            message: `PRIVATE_UPLOAD_DIR must NOT be inside the application root ("${appRoot}"). Place private uploads in an external folder like /home/<user>/altair-assets/private-uploads`,
          });
        }

        if (rawUploadDir && resolvedPrivate === path.resolve(rawUploadDir)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["PRIVATE_UPLOAD_DIR"],
            message:
              "PRIVATE_UPLOAD_DIR must be DIFFERENT from UPLOAD_DIR to prevent public exposure of private resumes.",
          });
        }
      }
    }
  });

export interface AppEnv {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  UPLOAD_DIR: string;
  PRIVATE_UPLOAD_DIR: string;
  SITE_URL?: string | undefined;
  ADMIN_EMAIL?: string | undefined;
  ADMIN_PASSWORD?: string | undefined;
}

function validateEnv(): AppEnv {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    console.error("❌ Environment configuration error:");
    for (const [key, errors] of Object.entries(fieldErrors)) {
      if (errors && errors.length > 0) {
        console.error(`   - ${key}: ${errors.join("; ")}`);
      }
    }
    throw new Error(
      "Invalid environment configuration. Check server environment variables or .env against .env.example",
    );
  }

  const parsed = result.data;

  // Resolve upload directories with development fallbacks outside src to prevent hot-reload churn
  const resolvedUploadDir =
    parsed.UPLOAD_DIR && parsed.UPLOAD_DIR.trim() !== ""
      ? path.resolve(parsed.UPLOAD_DIR.trim())
      : path.resolve(process.cwd(), "uploads");

  const resolvedPrivateUploadDir =
    parsed.PRIVATE_UPLOAD_DIR && parsed.PRIVATE_UPLOAD_DIR.trim() !== ""
      ? path.resolve(parsed.PRIVATE_UPLOAD_DIR.trim())
      : path.resolve(process.cwd(), "private-uploads");

  return {
    DATABASE_URL: parsed.DATABASE_URL,
    AUTH_SECRET: parsed.AUTH_SECRET,
    UPLOAD_DIR: resolvedUploadDir,
    PRIVATE_UPLOAD_DIR: resolvedPrivateUploadDir,
    ...(parsed.SITE_URL ? { SITE_URL: parsed.SITE_URL.replace(/\/+$/, "") } : {}),
    ...(parsed.ADMIN_EMAIL ? { ADMIN_EMAIL: parsed.ADMIN_EMAIL } : {}),
    ...(parsed.ADMIN_PASSWORD ? { ADMIN_PASSWORD: parsed.ADMIN_PASSWORD } : {}),
  };
}

export const env = validateEnv();
