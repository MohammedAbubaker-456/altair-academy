/**
 * Local & Staging Database Health Check Script
 *
 * Verifies connectivity to MongoDB through Prisma, executes the native MongoDB
 * `hello` administrative command, verifies that the connection is to a writable
 * replica set node (required for Prisma transactions), and translates errors into
 * actionable troubleshooting steps.
 *
 * Location: scripts/check-db.ts
 * Type: CLI Utility Script (run via `npm run db:check`)
 */

import { PrismaClient } from "@prisma/client";

async function checkDatabase() {
  console.log("🔍 Checking MongoDB connection and replica set status...");

  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    // Execute MongoDB 'hello' administrative command
    const rawResult = await prisma.$runCommandRaw({ hello: 1 });
    const result = rawResult as {
      ok?: number;
      setName?: string;
      isWritablePrimary?: boolean;
      ismaster?: boolean;
      me?: string;
      primary?: string;
      msg?: string;
    };

    if (result.ok !== 1) {
      console.error("❌ MongoDB returned an unsuccessful status:", result);
      process.exit(1);
    }

    // Check if the database instance is part of a replica set
    if (!result.setName) {
      console.error("\n❌ MongoDB is running standalone; Prisma needs a replica set.");
      console.error("   Prisma ORM requires multi-document transactions, which are only supported");
      console.error("   on MongoDB replica sets.\n");
      console.error("👉 Please follow the native setup guide to enable replication (rs0):");
      console.error("   docs/LOCAL_MONGODB_SETUP.md\n");
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

    console.log("\n✔ MongoDB connection successful!");
    console.log(`  Replica Set: ${result.setName}`);
    console.log(`  Node:        ${result.me ?? "connected node"}`);
    console.log("  Status:      Writable Primary (Transactions Supported)\n");

    process.exit(0);
  } catch (error: unknown) {
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
      console.error("👉 Verify the hostname or mongodb+srv connection string.");
      console.error("   Ensure your DNS resolver can resolve MongoDB Atlas hostnames.");
    } else if (
      errorMessage.includes("timed out") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("Server selection timed out")
    ) {
      console.error("\nReason: Connection timed out.");
      console.error("👉 If connecting to MongoDB Atlas:");
      console.error("   Ensure your outbound IP address is allowlisted under Network Access.");
      console.error("👉 If connecting to local MongoDB:");
      console.error(
        "   Verify that the MongoDB service is running (see docs/LOCAL_MONGODB_SETUP.md).",
      );
    } else if (errorMessage.includes("ECONNREFUSED")) {
      console.error("\nReason: Connection refused (127.0.0.1:27017).");
      console.error("👉 The local MongoDB service is not currently running.");
      console.error(
        "   Start the service: 'net start MongoDB' (Windows) or 'systemctl start mongod' (Linux).",
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
