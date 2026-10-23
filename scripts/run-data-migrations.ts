/**
 * Data Migrations Runner
 *
 * Runs unapplied programmatic data migration files from prisma/data-migrations/
 * in alphabetical order and logs completed migrations into MigrationLog.
 *
 * Run via: npm run db:data-migrate
 * Location: scripts/run-data-migrations.ts
 * Type: CLI Script
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking for pending MongoDB data migrations...");

  const migrationsDir = path.resolve(__dirname, "../prisma/data-migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("No migrations directory found.");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    .sort();

  if (files.length === 0) {
    console.log("No data migration files found.");
    return;
  }

  // Get applied migrations
  const appliedLogs = await prisma.migrationLog.findMany();
  const appliedSet = new Set(appliedLogs.map((log) => log.name));

  let appliedCount = 0;

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    const migrationModule = await import(`file://${migrationPath.replace(/\\/g, "/")}`);
    const migrationName: string = migrationModule.name || path.parse(file).name;

    if (appliedSet.has(migrationName)) {
      console.log(`⏩ Skipping ${migrationName} (already applied)`);
      continue;
    }

    console.log(`🚀 Running data migration: ${migrationName}...`);
    if (typeof migrationModule.up === "function") {
      await migrationModule.up(prisma);
      await prisma.migrationLog.create({
        data: {
          name: migrationName,
        },
      });
      appliedCount++;
      console.log(`✅ Applied ${migrationName}`);
    } else {
      console.warn(`⚠️ Warning: ${file} does not export an 'up' function.`);
    }
  }

  if (appliedCount === 0) {
    console.log("✨ All data migrations are already up to date.");
  } else {
    console.log(`🎉 Successfully applied ${appliedCount} data migration(s).`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Migration runner error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
