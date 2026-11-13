/**
 * Local & Staging Database Health Check Script
 *
 * Verifies connectivity to MariaDB / MySQL through Prisma, executes
 * `SELECT 1, VERSION(), DATABASE()`, and translates errors into
 * actionable troubleshooting steps.
 *
 * Location: scripts/check-db.ts
 * Type: CLI Utility Script (run via `npm run db:check`)
 */

import { PrismaClient } from "@prisma/client";

async function checkDatabase() {
  console.log("🔍 Checking MariaDB / MySQL connection status...");

  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    const rawResult = await prisma.$queryRawUnsafe<Array<{ ok: number; version: string; db_name: string }>>(
      "SELECT 1 as ok, VERSION() as version, DATABASE() as db_name",
    );

    const row = rawResult?.[0];

    if (!row || row.ok !== 1) {
      console.error("❌ Database returned an unexpected result:", rawResult);
      process.exit(1);
    }

    console.log("\n✔ MariaDB / MySQL connection successful!");
    console.log(`  Engine:   ${row.version}`);
    console.log(`  Database: ${row.db_name}`);
    console.log("  Status:   Ready\n");

    process.exit(0);
  } catch (error: unknown) {
    console.error("\n❌ Database connection failed.");

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("Access denied") ||
      errorMessage.includes("1045") ||
      errorMessage.includes("Authentication failed")
    ) {
      console.error("\nReason: Authentication failed.");
      console.error("👉 Check that the username and password in DATABASE_URL are correct.");
      console.error(
        "   Remember to URL-encode special characters in passwords (e.g. '@' -> '%40').",
      );
    } else if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("getaddrinfo")
    ) {
      console.error("\nReason: DNS / Hostname resolution failed.");
      console.error("👉 Verify the hostname in your DATABASE_URL (e.g. 127.0.0.1 or localhost).");
    } else if (
      errorMessage.includes("timed out") ||
      errorMessage.includes("ETIMEDOUT")
    ) {
      console.error("\nReason: Connection timed out.");
      console.error("👉 Verify the host and port (typically 3306) are reachable.");
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("Can't reach database server")) {
      console.error("\nReason: Connection refused (port 3306).");
      console.error("👉 The MariaDB / MySQL service is not currently running.");
      console.error(
        "   Start MySQL from the XAMPP Control Panel or run 'net start MySQL'.",
      );
    } else {
      console.error("\nDetails:", errorMessage);
    }

    console.error("");
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

void checkDatabase();
