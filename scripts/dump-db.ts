/**
 * Database Export & Dump Generator for phpMyAdmin / MariaDB 10.11
 *
 * Generates clean, production-ready SQL dumps compatible with GoDaddy cPanel
 * phpMyAdmin and MariaDB 10.11 without CREATE DATABASE or USE statements,
 * using explicit utf8mb4 encoding and foreign key safety.
 *
 * Output:
 *   - db-dumps/altair_academy_full.sql (schema + all seed/migrated data)
 *   - db-dumps/altair_academy_schema.sql (schema only)
 *
 * Location: scripts/dump-db.ts
 * Run via: npm run db:dump
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const projectRoot = process.cwd();
const dumpDir = path.resolve(projectRoot, "db-dumps");
fs.mkdirSync(dumpDir, { recursive: true });

// Find mysqldump executable
function findMysqldump(): string {
  const candidates = ["C:\\xampp\\mysql\\bin\\mysqldump.exe", "mysqldump"];

  for (const candidate of candidates) {
    try {
      if (candidate.includes("\\")) {
        if (fs.existsSync(candidate)) return candidate;
      } else {
        execFileSync(candidate, ["--version"], { stdio: "pipe" });
        return candidate;
      }
    } catch {
      // continue
    }
  }

  throw new Error(
    "mysqldump executable not found. Ensure XAMPP MariaDB is installed at C:\\xampp\\mysql",
  );
}

function parseDatabaseUrl(rawUrl?: string) {
  const url = new URL(rawUrl || "mysql://root@127.0.0.1:3306/altair_academy");
  return {
    host: url.hostname || "127.0.0.1",
    port: url.port || "3306",
    user: url.username || "root",
    password: url.password || "",
    database: url.pathname.replace(/^\//, "") || "altair_academy",
  };
}

async function runDump() {
  console.log("===============================================================================");
  console.log("Altair Academy — MariaDB / MySQL Dump Generator");
  console.log("===============================================================================\n");

  const mysqldumpBin = findMysqldump();
  console.log(`Using mysqldump: ${mysqldumpBin}`);

  const dbConfig = parseDatabaseUrl(process.env["DATABASE_URL"]);
  console.log(`Source Host:    ${dbConfig.host}:${dbConfig.port}`);
  console.log(`Source Database:${dbConfig.database}\n`);

  const commonArgs = [
    `--host=${dbConfig.host}`,
    `--port=${dbConfig.port}`,
    `--user=${dbConfig.user}`,
    ...(dbConfig.password ? [`--password=${dbConfig.password}`] : []),
    "--default-character-set=utf8mb4",
    "--single-transaction",
    "--quick",
    "--no-tablespaces",
    "--hex-blob",
    "--skip-triggers",
    "--add-drop-table",
    dbConfig.database,
  ];

  const fullDumpPath = path.join(dumpDir, "altair_academy_full.sql");
  const schemaDumpPath = path.join(dumpDir, "altair_academy_schema.sql");

  console.log("📦 Generating full SQL dump (schema + data)...");
  const fullDumpRaw = execFileSync(mysqldumpBin, commonArgs, {
    maxBuffer: 64 * 1024 * 1024,
    encoding: "utf8",
  });

  // Verify and post-process dump
  // Ensure no CREATE DATABASE or USE statements
  const sanitizedFull = fullDumpRaw
    .replace(/^CREATE DATABASE\b.*$/gim, "-- [REMOVED] CREATE DATABASE")
    .replace(/^USE\b.*$/gim, "-- [REMOVED] USE");

  fs.writeFileSync(fullDumpPath, sanitizedFull, "utf8");
  const fullStats = fs.statSync(fullDumpPath);
  console.log(`✔ Full dump created: ${fullDumpPath} (${(fullStats.size / 1024).toFixed(1)} KB)`);

  console.log("📦 Generating schema-only SQL dump...");
  const schemaArgs = ["--no-data", ...commonArgs];
  const schemaDumpRaw = execFileSync(mysqldumpBin, schemaArgs, {
    maxBuffer: 16 * 1024 * 1024,
    encoding: "utf8",
  });

  const sanitizedSchema = schemaDumpRaw
    .replace(/^CREATE DATABASE\b.*$/gim, "-- [REMOVED] CREATE DATABASE")
    .replace(/^USE\b.*$/gim, "-- [REMOVED] USE");

  fs.writeFileSync(schemaDumpPath, sanitizedSchema, "utf8");
  const schemaStats = fs.statSync(schemaDumpPath);
  console.log(
    `✔ Schema dump created: ${schemaDumpPath} (${(schemaStats.size / 1024).toFixed(1)} KB)\n`,
  );

  // Verify safety checks
  console.log("🔍 Verifying dump characteristics:");
  const hasUtf8mb4 = sanitizedFull.includes("SET NAMES utf8mb4");
  const hasDropTable = sanitizedFull.includes("DROP TABLE IF EXISTS");
  const hasCreateDatabase = /^\s*CREATE DATABASE\b/m.test(sanitizedFull);
  const hasUse = /^\s*USE\b/m.test(sanitizedFull);

  console.log(`  - UTF-8 (utf8mb4) headers     : ${hasUtf8mb4 ? "✔ PASS" : "❌ FAIL"}`);
  console.log(`  - DROP TABLE IF EXISTS        : ${hasDropTable ? "✔ PASS" : "❌ FAIL"}`);
  console.log(`  - NO CREATE DATABASE statement: ${!hasCreateDatabase ? "✔ PASS" : "❌ FAIL"}`);
  console.log(`  - NO USE database statement   : ${!hasUse ? "✔ PASS" : "❌ FAIL"}`);

  if (!hasUtf8mb4 || hasCreateDatabase || hasUse) {
    console.error("\n❌ Dump verification failed safety checks!");
    process.exit(1);
  }

  console.log("\n🎉 Dumps generated and verified successfully!");
}

runDump().catch((err) => {
  console.error("❌ Failed to generate dump:", err);
  process.exit(1);
});
