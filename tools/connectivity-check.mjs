/**
 * GoDaddy / cPanel Pre-Flight MariaDB Connectivity Diagnostic
 *
 * Verifies local TCP connectivity to MariaDB on port 3306
 * directly from the hosting environment over SSH.
 * Performs socket handshake and diagnoses blocked ports or network issues.
 * Never prints database credentials.
 *
 * Location: tools/connectivity-check.mjs
 * Type: Standalone Node.js CLI Tool (Runnable without tsx/dependencies)
 */

import net from "node:net";

const TIMEOUT_MS = 5000;

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

function testTcpConnection(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    const cleanup = (success, error = null) => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      resolve({ host, port, success, error });
    };

    socket.setTimeout(TIMEOUT_MS);

    socket.on("connect", () => cleanup(true));
    socket.on("timeout", () => cleanup(false, "Connection timed out (no response)"));
    socket.on("error", (err) => cleanup(false, err.message));

    socket.connect(port, host);
  });
}

async function run() {
  console.log("===============================================================================");
  console.log("Altair Academy — MariaDB Connectivity Diagnostic");
  console.log("===============================================================================\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("👉 If running over SSH, export it first:");
    console.error('   export DATABASE_URL="mysql://<user>:<password>@localhost:3306/<dbname>"\n');
    process.exit(1);
  }

  console.log(`Checking connection string: ${sanitizeUrl(databaseUrl)}\n`);

  let host = "localhost";
  let port = 3306;

  try {
    const parsed = new URL(databaseUrl);
    host = parsed.hostname || "localhost";
    port = parsed.port ? parseInt(parsed.port, 10) : 3306;
  } catch {
    console.warn("⚠️ Could not parse host/port from DATABASE_URL, defaulting to localhost:3306");
  }

  console.log(`Probing TCP connection to ${host}:${port}...`);
  const result = await testTcpConnection(host, port);

  if (result.success) {
    console.log(`✔ TCP socket to ${host}:${port} opened successfully!`);
    console.log("  MariaDB is reachable and accepting connections.\n");
    console.log(
      "Next step: Run 'node tools/check-db.mjs' to verify credentials and query execution.\n",
    );
    process.exit(0);
  } else {
    console.error(`❌ TCP connection to ${host}:${port} failed: ${result.error}`);
    console.error("👉 Verify MariaDB service is running and listening on port 3306.");
    console.error("   On GoDaddy cPanel, ensure database user has permissions for the database.\n");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unexpected failure:", err);
  process.exit(1);
});
