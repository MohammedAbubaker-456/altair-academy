/**
 * cPanel Standalone Production Packaging Script
 *
 * Prepares a self-contained, Linux-compatible deployment package for GoDaddy
 * "Web Hosting Deluxe" (cPanel with Phusion Passenger / "Setup Node.js App").
 *
 * Steps:
 * 1. Runs prisma generate & next build.
 * 2. Assembles deploy/cpanel-package/ from .next/standalone, .next/static, public, and tools.
 * 3. Enforces Linux target query engine (rhel-openssl-3.0.x) and Linux sharp binaries.
 * 4. Generates Passenger entry wrapper (app.js).
 * 5. Strips environment secrets (.env*) and persistent uploads directory.
 * 6. Compresses into deploy/altair-academy-cpanel.zip and altair-academy-cpanel.tar.gz.
 *
 * Location: scripts/package-cpanel.mjs
 * Type: Cross-Platform Build & Packaging Script
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const STANDALONE_DIR = path.join(projectRoot, ".next", "standalone");
const STATIC_DIR = path.join(projectRoot, ".next", "static");
const PUBLIC_DIR = path.join(projectRoot, "public");
const TOOLS_DIR = path.join(projectRoot, "tools");

const DEPLOY_DIR = path.join(projectRoot, "deploy");
const PACKAGE_DIR = path.join(DEPLOY_DIR, "cpanel-package");
const ZIP_OUTPUT = path.join(DEPLOY_DIR, "altair-academy-cpanel.zip");
const TAR_OUTPUT = path.join(DEPLOY_DIR, "altair-academy-cpanel.tar.gz");

const PRISMA_TARGET_ENGINE = "libquery_engine-rhel-openssl-3.0.x.so.node";

function run(command, cwd = projectRoot) {
  console.log(`\n▶ Running: ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function removeRecursiveSync(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

async function main() {
  console.log("===============================================================================");
  console.log("Altair Academy — GoDaddy cPanel Production Packaging");
  console.log("===============================================================================\n");

  // Step 1: Generate Prisma Client & Run Next.js Build
  console.log("Step 1: Generating Prisma Client for native and Linux targets...");
  run("npx prisma generate");

  console.log("\nStep 2: Building Next.js with standalone output...");
  run("npx next build");

  if (!fs.existsSync(STANDALONE_DIR)) {
    console.error(`❌ Standalone output directory not found at: ${STANDALONE_DIR}`);
    process.exit(1);
  }

  // Step 2: Clean and initialize deploy directories
  console.log("\nStep 3: Preparing clean deploy/cpanel-package staging area...");
  removeRecursiveSync(PACKAGE_DIR);
  fs.mkdirSync(PACKAGE_DIR, { recursive: true });

  // Step 3: Copy standalone files to root of package
  console.log("Step 4: Copying .next/standalone artifacts to package root...");
  copyRecursiveSync(STANDALONE_DIR, PACKAGE_DIR);

  // Step 4: Copy static assets
  console.log("Step 5: Copying .next/static to package .next/static...");
  const targetStaticDir = path.join(PACKAGE_DIR, ".next", "static");
  copyRecursiveSync(STATIC_DIR, targetStaticDir);

  // Step 5: Copy public folder (including seed images)
  console.log("Step 6: Copying public/ assets (seed media) to package public/...");
  const targetPublicDir = path.join(PACKAGE_DIR, "public");
  copyRecursiveSync(PUBLIC_DIR, targetPublicDir);

  // Step 6: Copy tools directory
  console.log("Step 7: Copying standalone diagnostic tools...");
  const targetToolsDir = path.join(PACKAGE_DIR, "tools");
  copyRecursiveSync(TOOLS_DIR, targetToolsDir);

  // Step 7: Create Passenger entry point wrapper (app.js)
  console.log("Step 8: Creating Passenger startup file (app.js)...");
  const appJsContent = `/**
 * Phusion Passenger / cPanel Entry Point Wrapper
 *
 * Forwards execution to the Next.js standalone server.js.
 *
 * Location: app.js
 * Type: Application Entry Wrapper
 */

import "./server.js";
`;
  fs.writeFileSync(path.join(PACKAGE_DIR, "app.js"), appJsContent, "utf8");

  // Step 8: Verify and ensure Linux Prisma Query Engine exists
  console.log("Step 9: Verifying Prisma query engine for Linux target (rhel-openssl-3.0.x)...");
  const standalonePrismaDir = path.join(PACKAGE_DIR, "node_modules", ".prisma", "client");
  const targetEnginePath = path.join(standalonePrismaDir, PRISMA_TARGET_ENGINE);

  if (!fs.existsSync(targetEnginePath)) {
    console.warn(
      `⚠️ Prisma query engine ${PRISMA_TARGET_ENGINE} not found in standalone node_modules.`,
    );
    console.log("   Attempting to copy from project root node_modules/.prisma/client...");
    const srcEngine = path.join(
      projectRoot,
      "node_modules",
      ".prisma",
      "client",
      PRISMA_TARGET_ENGINE,
    );
    if (fs.existsSync(srcEngine)) {
      fs.mkdirSync(standalonePrismaDir, { recursive: true });
      fs.copyFileSync(srcEngine, targetEnginePath);
      console.log(`   ✔ Copied ${PRISMA_TARGET_ENGINE} to package.`);
    } else {
      console.error(`❌ FAILED: Missing Prisma Linux query engine (${PRISMA_TARGET_ENGINE}).`);
      console.error(
        "   Run 'npx prisma generate' and verify binaryTargets in prisma/schema.prisma.",
      );
      process.exit(1);
    }
  } else {
    console.log(`   ✔ Found Prisma Linux engine: ${PRISMA_TARGET_ENGINE}`);
  }

  // Step 9: Verify and ensure Linux sharp binaries exist
  console.log("Step 10: Verifying Linux x64 sharp binaries for next/image optimization...");
  const targetSharpLinuxDir = path.join(PACKAGE_DIR, "node_modules", "@img", "sharp-linux-x64");
  const targetVipsLinuxDir = path.join(
    PACKAGE_DIR,
    "node_modules",
    "@img",
    "sharp-libvips-linux-x64",
  );

  if (!fs.existsSync(targetSharpLinuxDir)) {
    console.warn(
      "⚠️ @img/sharp-linux-x64 not found in standalone. Copying from root node_modules...",
    );
    const srcSharpLinux = path.join(projectRoot, "node_modules", "@img", "sharp-linux-x64");
    if (fs.existsSync(srcSharpLinux)) {
      copyRecursiveSync(srcSharpLinux, targetSharpLinuxDir);
      console.log("   ✔ Copied @img/sharp-linux-x64 into package.");
    } else {
      console.error("❌ FAILED: @img/sharp-linux-x64 not found in node_modules.");
      process.exit(1);
    }
  }

  if (!fs.existsSync(targetVipsLinuxDir)) {
    console.warn(
      "⚠️ @img/sharp-libvips-linux-x64 not found in standalone. Copying from root node_modules...",
    );
    const srcVipsLinux = path.join(projectRoot, "node_modules", "@img", "sharp-libvips-linux-x64");
    if (fs.existsSync(srcVipsLinux)) {
      copyRecursiveSync(srcVipsLinux, targetVipsLinuxDir);
      console.log("   ✔ Copied @img/sharp-libvips-linux-x64 into package.");
    }
  }

  // Double check sharp .node binary exists
  const sharpLibDir = path.join(targetSharpLinuxDir, "lib");
  const sharpNodes = fs.existsSync(sharpLibDir)
    ? fs.readdirSync(sharpLibDir).filter((f) => f.endsWith(".node"))
    : [];

  if (sharpNodes.length === 0) {
    console.error("❌ FAILED: No Linux .node binary found inside @img/sharp-linux-x64/lib.");
    process.exit(1);
  } else {
    console.log(`   ✔ Found Linux sharp binary: ${sharpNodes.join(", ")}`);
  }

  // Step 10: Strict Sanity Checks & Cleanup
  console.log("Step 11: Cleaning forbidden files (secrets, source, uploads folder)...");

  // Remove any .env files
  const filesInPackage = fs.readdirSync(PACKAGE_DIR);
  for (const file of filesInPackage) {
    if (file.startsWith(".env")) {
      console.log(`   Removing sensitive file from package: ${file}`);
      removeRecursiveSync(path.join(PACKAGE_DIR, file));
    }
  }

  // Remove uploads folder if present (uploads must live outside app root in production)
  const packageUploads = path.join(PACKAGE_DIR, "uploads");
  if (fs.existsSync(packageUploads)) {
    console.log("   Removing persistent uploads directory from package (never ship uploads)...");
    removeRecursiveSync(packageUploads);
  }

  // Ensure server.js exists
  if (!fs.existsSync(path.join(PACKAGE_DIR, "server.js"))) {
    console.error("❌ FAILED: server.js missing from package root.");
    process.exit(1);
  }

  // Step 11: Compress package for cPanel File Manager
  console.log("\nStep 12: Creating archive files for cPanel upload...");
  removeRecursiveSync(ZIP_OUTPUT);
  removeRecursiveSync(TAR_OUTPUT);

  try {
    console.log(`   Creating: ${path.basename(ZIP_OUTPUT)}...`);
    execSync(`tar -acf "${ZIP_OUTPUT}" -C "${PACKAGE_DIR}" .`, { stdio: "inherit" });
    const zipStats = fs.statSync(ZIP_OUTPUT);
    console.log(`   ✔ Zip created successfully (${(zipStats.size / (1024 * 1024)).toFixed(2)} MB)`);
  } catch (err) {
    console.warn(`   ⚠️ Warning: Failed to create zip via tar: ${err.message}`);
  }

  try {
    console.log(`   Creating: ${path.basename(TAR_OUTPUT)}...`);
    execSync(`tar -czf "${TAR_OUTPUT}" -C "${PACKAGE_DIR}" .`, { stdio: "inherit" });
    const tarStats = fs.statSync(TAR_OUTPUT);
    console.log(
      `   ✔ Tar.gz created successfully (${(tarStats.size / (1024 * 1024)).toFixed(2)} MB)`,
    );
  } catch (err) {
    console.warn(`   ⚠️ Warning: Failed to create tar.gz: ${err.message}`);
  }

  console.log("\n===============================================================================");
  console.log("✔ PACKAGING COMPLETE!");
  console.log("===============================================================================");
  console.log(`Package Folder:  ${PACKAGE_DIR}`);
  console.log(`cPanel Archive:  ${ZIP_OUTPUT}`);
  console.log(`Tar.gz Archive:  ${TAR_OUTPUT}`);
  console.log("\nDeployment Next Steps:");
  console.log("1. Upload altair-academy-cpanel.zip via cPanel File Manager into your app root.");
  console.log("2. Click 'Extract' in cPanel File Manager.");
  console.log("3. Configure environment variables in cPanel 'Setup Node.js App'.");
  console.log("4. Run 'node tools/connectivity-check.mjs' over SSH to verify Atlas connectivity.");
  console.log("5. Click 'Restart' in Setup Node.js App.");
  console.log("===============================================================================\n");
}

main().catch((err) => {
  console.error("❌ Packaging failed:", err);
  process.exit(1);
});
