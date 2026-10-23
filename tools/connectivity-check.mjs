/**
 * GoDaddy / cPanel Pre-Flight Network & DNS Connectivity Diagnostic
 *
 * Verifies outbound TCP connectivity to MongoDB Atlas hosts on port 27017
 * directly from the hosting environment over SSH. Resolves DNS SRV records,
 * performs raw socket handshakes, and diagnoses blocked ports or missing IP allowlists.
 * Never prints database credentials.
 *
 * Location: tools/connectivity-check.mjs
 * Type: Standalone Node.js CLI Tool (Runnable without tsx/dependencies)
 */

import dns from "node:dns/promises";
import net from "node:net";

const TIMEOUT_MS = 6000;

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
  });
}

async function run() {
  console.log("===============================================================================");
  console.log("Altair Academy — Outbound MongoDB Atlas Connectivity Diagnostic");
  console.log("===============================================================================\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("👉 If running over SSH, export it first:");
    console.error(
      '   export DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/..."\n',
    );
    console.error(
      "👉 In production, add DATABASE_URL in cPanel -> Setup Node.js App -> Environment Variables.",
    );
    process.exit(1);
  }

  console.log(`Configured Target: ${sanitizeUrl(databaseUrl)}\n`);

  let targetHosts = [];

  if (databaseUrl.startsWith("mongodb+srv://")) {
    try {
      const urlWithoutScheme = databaseUrl.replace(/^mongodb\+srv:\/\//, "");
      const hostPart = urlWithoutScheme.split("/")[0]?.split("@")?.pop();
      const hostname = hostPart?.split(":")[0];

      if (!hostname) {
        throw new Error("Unable to parse hostname from mongodb+srv string.");
      }

      console.log(`1. Resolving DNS SRV records for: _mongodb._tcp.${hostname}...`);
      const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);

      if (!srvRecords || srvRecords.length === 0) {
        console.error("❌ No SRV records returned by DNS resolver.");
        process.exit(1);
      }

      console.log(`   ✔ Discovered ${srvRecords.length} replica set nodes via DNS SRV.\n`);
      targetHosts = srvRecords.map((r) => ({ host: r.name, port: r.port }));
    } catch (err) {
      console.error(`❌ DNS SRV Resolution failed: ${err.message}`);
      console.error("👉 Check that the cluster hostname in DATABASE_URL is spelled correctly.");
      console.error("👉 Check that the server's nameservers can resolve external domains.");
      process.exit(1);
    }
  } else if (databaseUrl.startsWith("mongodb://")) {
    try {
      const parsed = new URL(databaseUrl);
      const host = parsed.hostname || "127.0.0.1";
      const port = parsed.port ? parseInt(parsed.port, 10) : 27017;
      targetHosts = [{ host, port }];
    } catch (err) {
      console.error(`❌ Unable to parse connection string: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.error("❌ Invalid DATABASE_URL protocol. Must start with mongodb:// or mongodb+srv://");
    process.exit(1);
  }

  console.log(`2. Testing raw TCP handshake to discovered node(s) on port 27017...`);
  let hasFailure = false;

  for (const target of targetHosts) {
    const result = await testTcpConnection(target.host, target.port);
    if (result.success) {
      console.log(`   ✔ PASS: Connected to ${target.host}:${target.port}`);
    } else {
      console.log(
        `   ❌ FAIL: Could not connect to ${target.host}:${target.port} (${result.error})`,
      );
      hasFailure = true;
    }
  }

  console.log("\n-------------------------------------------------------------------------------");
  if (!hasFailure) {
    console.log("✔ ALL CHECKS PASSED: Outbound TCP traffic to MongoDB Atlas is working perfectly.");
    console.log("  Your GoDaddy hosting environment can reach your database cluster.");
    process.exit(0);
  } else {
    console.error(
      "❌ CONNECTIVITY FAILED: One or more MongoDB cluster nodes could not be reached.",
    );
    console.error("\nTroubleshooting Steps for GoDaddy Shared Hosting:");
    console.error("1. Outbound Port 27017 Restriction:");
    console.error(
      "   Shared cPanel hosts occasionally restrict outbound TCP ports other than 80/443.",
    );
    console.error("   Contact GoDaddy Support if outbound port 27017 is blocked.");
    console.error("2. Atlas IP Allowlist:");
    console.error("   Check your server's outbound public IP address by running:");
    console.error("   curl -s https://ifconfig.me");
    console.error(
      "   Add that IP under MongoDB Atlas -> Security -> Network Access -> Add IP Address.",
    );
    process.exit(1);
  }
}

void run();
