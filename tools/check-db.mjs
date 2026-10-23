/**
 * Standalone Database Verification Tool for cPanel / Production
 *
 * Connects to MongoDB via PrismaClient, executes the raw `hello` command,
 * and validates that the database is an active, writable replica set member.
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
  console.log("Altair Academy — Database Connection & Replica Set Diagnostic");
  console.log("===============================================================================\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("👉 If running over SSH, export it first or enter the cPanel Node virtualenv:");
    console.error(
      '   export DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/..."\n',
    );
    process.exit(1);
  }

  console.log(`Connecting to: ${sanitizeUrl(databaseUrl)}...\n`);

  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    const result = await prisma.$runCommandRaw({ hello: 1 });

    if (!result || result.ok !== 1) {
      console.error("❌ MongoDB returned an unsuccessful status:", result);
      process.exit(1);
    }

    if (!result.setName) {
      console.error("\n❌ MongoDB is running standalone; Prisma needs a replica set.");
      console.error(
        "   Prisma requires multi-document transactions, supported only on replica sets.",
      );
      process.exit(1);
    }

    const isWritable = result.isWritablePrimary ?? result.ismaster ?? false;

    if (!isWritable) {
      console.warn(
        `⚠️ Connected to replica set "${result.setName}", but the node (${result.me ?? "unknown"}) is not a writable primary.`,
      );
      console.warn(`   Current primary node: ${result.primary ?? "electing..."}`);
      process.exit(1);
    }

    console.log("✔ SUCCESS: Connected to MongoDB successfully!");
    console.log(`  Replica Set: ${result.setName}`);
    console.log(`  Connected Node: ${result.me ?? "primary"}`);
    console.log("  Status: Writable Primary (Transactions Ready)\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ MongoDB connection failed.");
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("AuthenticationFailed") ||
      errorMessage.includes("bad auth") ||
      errorMessage.includes("code 18")
    ) {
      console.error("\nReason: Authentication failed.");
      console.error("👉 Check that the username and password in DATABASE_URL are correct.");
      console.error(
        "   Remember to URL-encode special characters in passwords (e.g. '@' -> '%40').",
      );
    } else if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("querySrv") ||
      errorMessage.includes("getaddrinfo")
    ) {
      console.error("\nReason: DNS / Hostname resolution failed.");
      console.error("👉 Verify the hostname in DATABASE_URL.");
      console.error("   Ensure your DNS resolver can resolve MongoDB Atlas hostnames.");
    } else if (
      errorMessage.includes("timed out") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("Server selection timed out")
    ) {
      console.error("\nReason: Connection timed out.");
      console.error(
        "👉 Check if your cPanel server's public IP address is allowlisted in Atlas Network Access.",
      );
      console.error("   Run 'curl -s https://ifconfig.me' to find the outbound IP.");
    } else if (errorMessage.includes("ECONNREFUSED")) {
      console.error("\nReason: Connection refused (127.0.0.1:27017).");
      console.error("👉 The local MongoDB service is not running.");
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
