/**
 * Clean Development Server Launcher
 *
 * Cross-platform script that deletes the .next build cache and starts `next dev`.
 * Useful after pulling branch updates, compilation restarts, or interrupted sessions
 * to ensure client bundles and Server Action manifests stay perfectly in sync.
 *
 * Location: scripts/dev-clean.mjs
 */

import fs from "node:fs";
import { spawn } from "node:child_process";

console.log("🧹 [dev:clean] Removing .next cache directory...");
try {
  fs.rmSync(".next", { recursive: true, force: true });
  console.log("✅ [dev:clean] .next directory cleared.");
} catch (err) {
  console.warn("⚠️  [dev:clean] Warning while clearing .next:", err.message);
}

console.log("🚀 [dev:clean] Starting Next.js development server on http://localhost:3000...\n");

const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
