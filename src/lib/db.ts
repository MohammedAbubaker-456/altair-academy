/**
 * Prisma Database Client Singleton
 *
 * Provides a shared PrismaClient instance across the server environment.
 * Uses globalThis caching in non-production to prevent connection exhaustion
 * during Next.js hot module reloading (HMR).
 *
 * Location: src/lib/db.ts
 * Type: Server-Only Module
 */

import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
