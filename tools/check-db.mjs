/**
 * Standalone Database Verification Tool for cPanel / Production
 *
 * Connects to MariaDB / MySQL via PrismaClient, executes `SELECT 1, VERSION(), DATABASE()`,
 * and validates database connectivity.
 * Designed to run over SSH inside the cPanel Node.js virtual environment without tsx.
 * Never prints database credentials.
 *
 * Location: tools/check-db.mjs
 * Type: Standalone Node.js CLI Tool
 */

import { PrismaClient } from "@prisma/client";

function sanitizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.password) {
      parsed.password = "******";
    }
    return parsed.toString();
  } catch {
    return "[invalid-url-format]";
  }
}

async function checkDatabase() {
  console.log("===============================================================================");
  console.log("Altair Academy — MariaDB / MySQL Database Connection Diagnostic");
  console.log("===============================================================================\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("👉 If running over SSH, export it first or enter the cPanel Node virtualenv:");
    console.error('   export DATABASE_URL="mysql://<user>:<password>@localhost:3306/<dbname>"\n');
    process.exit(1);
  }

  console.log(`Connecting to: ${sanitizeUrl(databaseUrl)}...\n`);

  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    const rawResult = await prisma.$queryRawUnsafe(
      "SELECT 1 as ok, VERSION() as version, DATABASE() as db_name",
    );

    const row = rawResult?.[0];

    if (!row || row.ok !== 1) {
      console.error("❌ Database returned an unexpected result:", rawResult);
      process.exit(1);
    }

    console.log("✔ SUCCESS: Connected to MariaDB / MySQL successfully!");
    console.log(`  Engine:   ${row.version}`);
    console.log(`  Database: ${row.db_name}`);
    console.log("  Status:   Ready\n");

    process.exit(0);
  } catch (error) {
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
    } else if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo")) {
      console.error("\nReason: DNS / Hostname resolution failed.");
      console.error("👉 Verify the hostname in DATABASE_URL (e.g. localhost or 127.0.0.1).");
    } else if (errorMessage.includes("timed out") || errorMessage.includes("ETIMEDOUT")) {
      console.error("\nReason: Connection timed out.");
      console.error("👉 Check host and port (3306).");
    } else if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("Can't reach database server")
    ) {
      console.error("\nReason: Connection refused (port 3306).");
      console.error("👉 Verify that MySQL/MariaDB is running.");
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
