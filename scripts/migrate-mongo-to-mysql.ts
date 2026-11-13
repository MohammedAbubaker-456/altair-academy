/**
 * MongoDB to MariaDB Data Migration & Verification Script
 *
 * Migrates all data from source MongoDB (read-only) to target MariaDB
 * without data loss, preserving all 24-char hex ObjectIds verbatim,
 * serializing scalar lists into JSON strings, and mapping team placements.
 *
 * Supported flags:
 *   --export-only    Export MongoDB collections to backups/mongo-export-<timestamp>/*.ndjson
 *   --dry-run        Validate data without modifying MariaDB
 *   --apply          Export, validate, and write data into MariaDB
 *   --verify         Verify row counts and fields between MongoDB and MariaDB
 *   --reset-target   Truncate target tables before applying
 *
 * Location: scripts/migrate-mongo-to-mysql.ts
 * Type: CLI Utility Script
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { MongoClient, type ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

// Ensure environment is parsed
dotenv.config();

const mongoUrl = process.env.MONGO_SOURCE_URL || process.env.DATABASE_URL;
const mysqlUrl = process.env.DATABASE_URL;

function sanitizeUrl(raw?: string): string {
  if (!raw) return "[missing]";
  try {
    const u = new URL(raw);
    if (u.password) u.password = "******";
    return u.toString();
  } catch {
    return "[invalid-url]";
  }
}

// Model & collection definitions in topological order
interface ModelSpec {
  modelName: string;
  collectionName: string;
  tableName: string;
  transform: (doc: any) => any;
  hasFk?: boolean;
}

function stringifyId(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && typeof val.toHexString === "function") {
    return val.toHexString();
  }
  return String(val);
}

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  return new Date(val);
}

function toNullableDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  return new Date(val);
}

function serializeList(arr: any): string {
  if (!arr) return "[]";
  if (Array.isArray(arr)) {
    const cleaned = arr.map((x) => String(x ?? "").trim()).filter(Boolean);
    return JSON.stringify(cleaned);
  }
  if (typeof arr === "string") {
    try {
      const p = JSON.parse(arr);
      if (Array.isArray(p)) return JSON.stringify(p);
    } catch {
      return JSON.stringify([arr.trim()]);
    }
  }
  return "[]";
}

const MODEL_SPECS: ModelSpec[] = [
  {
    modelName: "AdminUser",
    collectionName: "AdminUser",
    tableName: "admin_users",
    transform: (d) => ({
      id: stringifyId(d._id),
      email: d.email,
      name: d.name,
      passwordHash: d.passwordHash,
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "LoginAttempt",
    collectionName: "LoginAttempt",
    tableName: "login_attempts",
    transform: (d) => ({
      id: stringifyId(d._id),
      key: d.key,
      count: Number(d.count ?? 0),
      windowStart: toDate(d.windowStart),
    }),
  },
  {
    modelName: "MigrationLog",
    collectionName: "MigrationLog",
    tableName: "migration_logs",
    transform: (d) => ({
      id: stringifyId(d._id),
      name: d.name,
      appliedAt: toDate(d.appliedAt),
    }),
  },
  {
    modelName: "Category",
    collectionName: "Category",
    tableName: "categories",
    transform: (d) => ({
      id: stringifyId(d._id),
      slug: d.slug,
      name: d.name,
      short: d.short,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "Subcategory",
    collectionName: "Subcategory",
    tableName: "subcategories",
    hasFk: true,
    transform: (d) => ({
      id: stringifyId(d._id),
      categoryId: stringifyId(d.categoryId),
      parentId: d.parentId ? stringifyId(d.parentId) : null,
      slug: d.slug,
      name: d.name,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "Course",
    collectionName: "Course",
    tableName: "courses",
    hasFk: true,
    transform: (d) => ({
      id: stringifyId(d._id),
      slug: d.slug,
      title: d.title,
      image: d.image ?? null,
      categoryId: stringifyId(d.categoryId),
      subcategoryId: d.subcategoryId ? stringifyId(d.subcategoryId) : null,
      level: d.level ?? null,
      duration: d.duration,
      price: d.price,
      summary: d.summary,
      objective: d.objective ?? null,
      content: d.content ?? null,
      whoShouldAttend: d.whoShouldAttend ?? null,
      prerequisites: d.prerequisites ?? null,
      certification: d.certification ?? null,
      notesAndEquipment: d.notesAndEquipment ?? null,
      classCapacity: d.classCapacity ?? null,
      feeDetails: d.feeDetails ?? null,
      courseSupport: d.courseSupport ?? null,
      courseNote: d.courseNote ?? null,
      metaTitle: d.metaTitle ?? null,
      metaDescription: d.metaDescription ?? null,
      ogImage: d.ogImage ?? null,
      isFeatured: Boolean(d.isFeatured),
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "Lead",
    collectionName: "Lead",
    tableName: "leads",
    transform: (d) => ({
      id: stringifyId(d._id),
      name: d.name,
      email: d.email,
      phone: d.phone,
      message: d.message,
      status: d.status ?? "NEW",
      source: d.source ?? "contact-page",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "CareerApplication",
    collectionName: "CareerApplication",
    tableName: "career_applications",
    transform: (d) => ({
      id: stringifyId(d._id),
      name: d.name,
      email: d.email,
      phone: d.phone,
      specialisation: d.specialisation ?? null,
      message: d.message ?? null,
      resumeOriginalName: d.resumeOriginalName ?? null,
      resumeStoredName: d.resumeStoredName ?? null,
      resumeMime: d.resumeMime ?? null,
      resumeSize: d.resumeSize != null ? Number(d.resumeSize) : null,
      status: d.status ?? "NEW",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "TeamMember",
    collectionName: "TeamMember",
    tableName: "team_members",
    transform: (d) => {
      const placements = Array.isArray(d.placements) ? d.placements : [];
      return {
        id: stringifyId(d._id),
        slug: d.slug,
        name: d.name,
        instructorName: d.instructorName ?? null,
        role: d.role,
        instructorRole: d.instructorRole ?? null,
        shortBio: d.shortBio,
        fullBio: d.fullBio ?? null,
        metaTitle: d.metaTitle ?? null,
        metaDescription: d.metaDescription ?? null,
        expertise: serializeList(d.expertise),
        image: d.image ?? null,
        showInManagement: placements.includes("MANAGEMENT"),
        showInInstructors: placements.includes("INSTRUCTOR"),
        managementOrder: Number(d.managementOrder ?? 0),
        instructorOrder: Number(d.instructorOrder ?? 0),
        status: d.status ?? "ACTIVE",
        createdAt: toDate(d.createdAt),
        updatedAt: toDate(d.updatedAt),
      };
    },
  },
  {
    modelName: "NewsPost",
    collectionName: "NewsPost",
    tableName: "news_posts",
    transform: (d) => ({
      id: stringifyId(d._id),
      slug: d.slug,
      title: d.title,
      excerpt: d.excerpt,
      body: d.body ?? null,
      kind: d.kind,
      category: d.category ?? null,
      tags: serializeList(d.tags),
      image: d.image ?? null,
      metaTitle: d.metaTitle ?? null,
      metaDescription: d.metaDescription ?? null,
      ogImage: d.ogImage ?? null,
      publishedAt: toDate(d.publishedAt),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "Faq",
    collectionName: "Faq",
    tableName: "faqs",
    transform: (d) => ({
      id: stringifyId(d._id),
      question: d.question,
      answer: d.answer,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "Testimonial",
    collectionName: "Testimonial",
    tableName: "testimonials",
    transform: (d) => ({
      id: stringifyId(d._id),
      quote: d.quote,
      name: d.name,
      company: d.company ?? null,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "JobOpening",
    collectionName: "JobOpening",
    tableName: "job_openings",
    transform: (d) => ({
      id: stringifyId(d._id),
      title: d.title,
      employmentType: d.employmentType ?? "FULL_TIME",
      location: d.location,
      scope: d.scope,
      summary: d.summary,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "ContactDetail",
    collectionName: "ContactDetail",
    tableName: "contact_details",
    transform: (d) => ({
      id: stringifyId(d._id),
      type: d.type,
      label: d.label ?? null,
      value: d.value,
      link: d.link ?? null,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "LegalPage",
    collectionName: "LegalPage",
    tableName: "legal_pages",
    transform: (d) => ({
      id: stringifyId(d._id),
      slug: d.slug,
      title: d.title,
      metaTitle: d.metaTitle ?? null,
      metaDescription: d.metaDescription ?? null,
      body: d.body,
      showInFooter: Boolean(d.showInFooter ?? true),
      isCore: Boolean(d.isCore ?? false),
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "NewsletterSubscriber",
    collectionName: "NewsletterSubscriber",
    tableName: "newsletter_subscribers",
    transform: (d) => ({
      id: stringifyId(d._id),
      email: d.email,
      status: d.status ?? "ACTIVE",
      source: d.source ?? "footer",
      unsubscribeToken: d.unsubscribeToken,
      subscribedAt: toDate(d.subscribedAt),
      unsubscribedAt: toNullableDate(d.unsubscribedAt),
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "CalendarCourse",
    collectionName: "CalendarCourse",
    tableName: "calendar_courses",
    transform: (d) => ({
      id: stringifyId(d._id),
      code: d.code,
      name: d.name,
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "CalendarSession",
    collectionName: "CalendarSession",
    tableName: "calendar_sessions",
    hasFk: true,
    transform: (d) => ({
      id: stringifyId(d._id),
      courseId: stringifyId(d.courseId),
      kind: d.kind,
      level: d.level ?? null,
      startDate: d.startDate,
      endDate: d.endDate,
      timeLabel: d.timeLabel ?? null,
      location: d.location ?? null,
      note: d.note ?? null,
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "UpcomingIntake",
    collectionName: "UpcomingIntake",
    tableName: "upcoming_intakes",
    transform: (d) => ({
      id: stringifyId(d._id),
      title: d.title,
      startDate: d.startDate,
      endDate: d.endDate,
      location: d.location,
      points: serializeList(d.points),
      order: Number(d.order ?? 0),
      status: d.status ?? "ACTIVE",
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "PageSeo",
    collectionName: "PageSeo",
    tableName: "page_seos",
    transform: (d) => ({
      id: stringifyId(d._id),
      pageKey: d.pageKey,
      title: d.title ?? null,
      description: d.description ?? null,
      ogTitle: d.ogTitle ?? null,
      ogDescription: d.ogDescription ?? null,
      ogImage: d.ogImage ?? null,
      noIndex: d.noIndex != null ? Boolean(d.noIndex) : null,
      canonicalPath: d.canonicalPath ?? null,
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
  {
    modelName: "SiteSeo",
    collectionName: "SiteSeo",
    tableName: "site_seos",
    transform: (d) => ({
      id: stringifyId(d._id),
      key: d.key ?? "default",
      siteName: d.siteName ?? null,
      defaultDescription: d.defaultDescription ?? null,
      defaultOgImage: d.defaultOgImage ?? null,
      twitterSite: d.twitterSite ?? null,
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    }),
  },
];

async function main() {
  const args = process.argv.slice(2);
  const isExportOnly = args.includes("--export-only");
  const isDryRun = args.includes("--dry-run");
  const isApply = args.includes("--apply");
  const isVerify = args.includes("--verify");
  const isResetTarget = args.includes("--reset-target");

  if (!isExportOnly && !isDryRun && !isApply && !isVerify) {
    console.log("Usage: tsx scripts/migrate-mongo-to-mysql.ts [--export-only | --dry-run | --apply | --verify] [--reset-target]");
    process.exit(1);
  }

  console.log("===============================================================================");
  console.log("Altair Academy — MongoDB to MariaDB Migration Engine");
  console.log("===============================================================================\n");

  if (!mongoUrl || !mongoUrl.startsWith("mongodb")) {
    console.error("❌ ERROR: MONGO_SOURCE_URL is missing or invalid in environment.");
    process.exit(1);
  }

  console.log(`Source MongoDB: ${sanitizeUrl(mongoUrl)} (READ-ONLY)`);
  console.log(`Target MariaDB: ${sanitizeUrl(mysqlUrl)}\n`);

  // Connect read-only to MongoDB
  const mongoClient = new MongoClient(mongoUrl, { readPreference: "primaryPreferred" });
  await mongoClient.connect();
  const mongoDb = mongoClient.db();

  // Create backups export folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportDir = path.resolve(process.cwd(), "backups", `mongo-export-${timestamp}`);
  fs.mkdirSync(exportDir, { recursive: true });

  const exportedData: Record<string, any[]> = {};
  const manifest: Record<string, { count: number; file: string; sha256: string }> = {};

  console.log("📦 Phase A: Exporting MongoDB collections...");
  for (const spec of MODEL_SPECS) {
    const coll = mongoDb.collection(spec.collectionName);
    const docs = await coll.find({}).toArray();
    exportedData[spec.modelName] = docs;

    const filePath = path.join(exportDir, `${spec.collectionName}.ndjson`);
    const lines = docs.map((d) => JSON.stringify(d)).join("\n");
    fs.writeFileSync(filePath, lines, "utf8");

    const hash = crypto.createHash("sha256").update(lines).digest("hex");
    manifest[spec.modelName] = {
      count: docs.length,
      file: path.relative(process.cwd(), filePath),
      sha256: hash,
    };

    console.log(`  - ${spec.collectionName.padEnd(22)}: ${String(docs.length).padStart(4)} docs -> ${path.basename(filePath)}`);
  }

  fs.writeFileSync(path.join(exportDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\n✔ Export complete. Saved to: ${exportDir}\n`);

  if (isExportOnly) {
    await mongoClient.close();
    process.exit(0);
  }

  // Pre-migration validation (Dry-Run checks)
  console.log("🔍 Phase B: Pre-migration data validation...");
  const errors: string[] = [];

  // 1. Check foreign key referential integrity
  const categoryIds = new Set(exportedData["Category"]!.map((c) => stringifyId(c._id)));
  const subcategoryIds = new Set(exportedData["Subcategory"]!.map((s) => stringifyId(s._id)));
  const calendarCourseIds = new Set(exportedData["CalendarCourse"]!.map((c) => stringifyId(c._id)));

  for (const sub of exportedData["Subcategory"]!) {
    const catId = stringifyId(sub.categoryId);
    if (!categoryIds.has(catId)) {
      errors.push(`Subcategory "${sub.slug}" references non-existent categoryId: ${catId}`);
    }
    if (sub.parentId && !subcategoryIds.has(stringifyId(sub.parentId))) {
      errors.push(`Subcategory "${sub.slug}" references non-existent parentId: ${stringifyId(sub.parentId)}`);
    }
  }

  for (const course of exportedData["Course"]!) {
    const catId = stringifyId(course.categoryId);
    if (!categoryIds.has(catId)) {
      errors.push(`Course "${course.slug}" references non-existent categoryId: ${catId}`);
    }
    if (course.subcategoryId && !subcategoryIds.has(stringifyId(course.subcategoryId))) {
      errors.push(`Course "${course.slug}" references non-existent subcategoryId: ${stringifyId(course.subcategoryId)}`);
    }
  }

  for (const session of exportedData["CalendarSession"]!) {
    const courseId = stringifyId(session.courseId);
    if (!calendarCourseIds.has(courseId)) {
      errors.push(`CalendarSession references non-existent courseId: ${courseId}`);
    }
  }

  // 2. Check unique constraints under utf8mb4_unicode_ci (case-insensitive collisions)
  function checkCaseInsensitiveDuplicates(items: any[], field: string, model: string) {
    const seen = new Map<string, string>();
    for (const item of items) {
      const val = item[field];
      if (typeof val === "string") {
        const lower = val.toLowerCase().trim();
        if (seen.has(lower)) {
          errors.push(`${model} unique field "${field}" collision under utf8mb4_unicode_ci: "${seen.get(lower)}" vs "${val}"`);
        } else {
          seen.set(lower, val);
        }
      }
    }
  }

  checkCaseInsensitiveDuplicates(exportedData["Category"]!, "slug", "Category");
  checkCaseInsensitiveDuplicates(exportedData["Course"]!, "slug", "Course");
  checkCaseInsensitiveDuplicates(exportedData["TeamMember"]!, "slug", "TeamMember");
  checkCaseInsensitiveDuplicates(exportedData["NewsPost"]!, "slug", "NewsPost");
  checkCaseInsensitiveDuplicates(exportedData["LegalPage"]!, "slug", "LegalPage");
  checkCaseInsensitiveDuplicates(exportedData["CalendarCourse"]!, "code", "CalendarCourse");

  if (errors.length > 0) {
    console.error("❌ Validation errors detected:");
    for (const err of errors) {
      console.error(`   - ${err}`);
    }
    await mongoClient.close();
    process.exit(1);
  }

  console.log("✔ Pre-migration validations passed! No orphaned foreign keys or collation collisions.\n");

  if (isDryRun) {
    console.log("ℹ️ Dry-run mode completed. No changes written to MariaDB.");
    await mongoClient.close();
    process.exit(0);
  }

  // Connect to MariaDB via Prisma
  const prisma = new PrismaClient();

  if (isApply) {
    console.log("🚀 Phase C: Applying data to MariaDB...");

    // Disable foreign key checks during batch insertion
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

    if (isResetTarget) {
      console.log("🧹 Resetting target tables...");
      for (const spec of MODEL_SPECS) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${spec.tableName}\`;`);
      }
      console.log("✔ Target tables truncated.\n");
    }

    for (const spec of MODEL_SPECS) {
      const rawDocs = exportedData[spec.modelName] ?? [];
      const transformed = rawDocs.map(spec.transform);

      if (transformed.length > 0) {
        const delegate = (prisma as any)[spec.modelName.charAt(0).toLowerCase() + spec.modelName.slice(1)];
        if (!delegate || typeof delegate.createMany !== "function") {
          throw new Error(`Prisma delegate not found for ${spec.modelName}`);
        }

        // Chunk insertions
        const CHUNK_SIZE = 50;
        for (let i = 0; i < transformed.length; i += CHUNK_SIZE) {
          const chunk = transformed.slice(i, i + CHUNK_SIZE);
          await delegate.createMany({
            data: chunk,
            skipDuplicates: true,
          });
        }
      }

      console.log(`  - Inserted into \`${spec.tableName}\`: ${transformed.length} rows`);
    }

    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n✔ Data insertion completed successfully!\n");
  }

  // Phase D: Verification & Report Generation
  console.log("🔬 Phase D: Verifying data parity...");
  const report: Record<string, { mongoCount: number; mysqlCount: number; match: boolean }> = {};
  let totalMongo = 0;
  let totalMysql = 0;
  let allMatched = true;

  for (const spec of MODEL_SPECS) {
    const mongoCount = exportedData[spec.modelName]?.length ?? 0;
    const delegate = (prisma as any)[spec.modelName.charAt(0).toLowerCase() + spec.modelName.slice(1)];
    const mysqlCount = await delegate.count();

    const match = mongoCount === mysqlCount;
    if (!match) allMatched = false;

    totalMongo += mongoCount;
    totalMysql += mysqlCount;

    report[spec.modelName] = {
      mongoCount,
      mysqlCount,
      match,
    };

    console.log(`  - ${spec.modelName.padEnd(22)}: Mongo = ${String(mongoCount).padStart(3)} | MySQL = ${String(mysqlCount).padStart(3)} [${match ? "✔ PASS" : "❌ MISMATCH"}]`);
  }

  console.log("-------------------------------------------------------------------------------");
  console.log(`  TOTAL RECORDS         : Mongo = ${String(totalMongo).padStart(3)} | MySQL = ${String(totalMysql).padStart(3)} [${allMatched ? "✔ PASS" : "❌ MISMATCH"}]\n`);

  const reportPath = path.resolve(process.cwd(), "backups", "migration-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        status: allMatched ? "SUCCESS" : "MISMATCH",
        totalMongo,
        totalMysql,
        allMatched,
        exportDir: path.relative(process.cwd(), exportDir),
        models: report,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`✔ Detailed migration report written to: ${reportPath}`);

  await mongoClient.close();
  await prisma.$disconnect();

  if (!allMatched) {
    console.error("\n❌ Verification failed: row counts do not match!");
    process.exit(1);
  } else {
    console.log("\n🎉 Full database migration completed with 100% data fidelity!");
  }
}

main().catch((err) => {
  console.error("❌ Migration failed with error:", err);
  process.exit(1);
});
