/**
 * Admin User Creation CLI Script
 *
 * Prompts for admin user credentials or accepts flags/env vars to create
 * or update an administrator account with bcrypt (salt rounds: 12).
 *
 * Run via: npm run admin:create
 * Location: scripts/create-admin.ts
 * Type: CLI Script
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

function ask(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hideInput) {
      process.stdout.write(query);
      let input = "";
      const onData = (char: Buffer) => {
        const str = char.toString("utf-8");
        switch (str) {
          case "\n":
          case "\r":
          case "\u0004":
            process.stdin.removeListener("data", onData);
            break;
          default:
            input += str;
            break;
        }
      };
      process.stdin.on("data", onData);
      rl.on("close", () => {
        console.log();
        resolve(input.trim());
      });
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("🔐 Altair Academy - Create or Update Admin User\n");

  const emailArg = process.argv.find((a) => a.startsWith("--email="))?.split("=")[1];
  const passwordArg = process.argv.find((a) => a.startsWith("--password="))?.split("=")[1];
  const nameArg = process.argv.find((a) => a.startsWith("--name="))?.split("=")[1];

  const email = (emailArg || (await ask("Admin Email: "))).toLowerCase().trim();
  if (!email || !email.includes("@")) {
    console.error("❌ A valid email address is required.");
    process.exit(1);
  }

  const name = nameArg || (await ask("Admin Name [Default: Administrator]: ")) || "Administrator";
  const password = passwordArg || (await ask("Admin Password (min 8 chars): "));
  if (!password || password.length < 8) {
    console.error("❌ Password must be at least 8 characters long.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
    },
  });

  console.log(`\n✅ Administrator '${admin.name}' (${admin.email}) successfully created/updated!`);
}

main()
  .catch((e) => {
    console.error("❌ Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
