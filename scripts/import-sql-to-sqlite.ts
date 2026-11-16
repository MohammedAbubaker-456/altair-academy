/**
 * Idempotent SQL Dump to SQLite Data Migration Script
 *
 * Imports all existing records from the MySQL/MariaDB SQL dump into SQLite
 * using Prisma Client, preserving IDs, bcrypt password hashes, relationships,
 * booleans, timestamps, and nullable values.
 *
 * Safe to execute multiple times (upsert semantics).
 *
 * Usage:
 *   npx tsx scripts/import-sql-to-sqlite.ts [path-to-sql-dump]
 *
 * Location: scripts/import-sql-to-sqlite.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

function parseSqlDump(sqlContent: string) {
  const tables: Record<string, { columns: string[]; rows: any[] }> = {};

  let pos = 0;
  const len = sqlContent.length;

  while (pos < len) {
    const insertIdx = sqlContent.indexOf("INSERT INTO `", pos);
    if (insertIdx === -1) break;

    const tableStart = insertIdx + "INSERT INTO `".length;
    const tableEnd = sqlContent.indexOf("`", tableStart);
    if (tableEnd === -1) break;
    const tableName = sqlContent.slice(tableStart, tableEnd);

    const colStart = sqlContent.indexOf("(", tableEnd);
    const colEnd = sqlContent.indexOf(") VALUES", colStart);
    if (colStart === -1 || colEnd === -1) break;

    const colString = sqlContent.slice(colStart + 1, colEnd);
    const columns = colString.split(",").map((c) => c.trim().replace(/^`|`$/g, ""));

    if (!tables[tableName]) {
      tables[tableName] = { columns, rows: [] };
    }

    pos = colEnd + ") VALUES".length;

    while (pos < len) {
      while (pos < len && /\s/.test(sqlContent[pos]!)) pos++;

      if (pos >= len || sqlContent[pos] !== "(") {
        break;
      }

      pos++; // skip '('
      const rowVals: any[] = [];

      while (pos < len) {
        while (pos < len && /\s/.test(sqlContent[pos]!)) pos++;

        if (sqlContent[pos] === ")") {
          pos++; // end of row
          break;
        }

        if (sqlContent[pos] === "'") {
          pos++; // skip opening '
          let val = "";
          while (pos < len) {
            const ch = sqlContent[pos]!;
            if (ch === "\\") {
              const next = sqlContent[pos + 1];
              if (next === "'") val += "'";
              else if (next === '"') val += '"';
              else if (next === "\\") val += "\\";
              else if (next === "n") val += "\n";
              else if (next === "r") val += "\r";
              else if (next === "t") val += "\t";
              else if (next === "0") val += "\0";
              else val += next;
              pos += 2;
            } else if (ch === "'") {
              if (sqlContent[pos + 1] === "'") {
                val += "'";
                pos += 2;
              } else {
                pos++; // skip closing '
                break;
              }
            } else {
              val += ch;
              pos++;
            }
          }
          rowVals.push(val);
        } else {
          let token = "";
          while (pos < len && sqlContent[pos] !== "," && sqlContent[pos] !== ")") {
            token += sqlContent[pos];
            pos++;
          }
          token = token.trim();
          if (token.toUpperCase() === "NULL") {
            rowVals.push(null);
          } else if (/^-?\d+$/.test(token)) {
            rowVals.push(parseInt(token, 10));
          } else if (/^-?\d+\.\d+$/.test(token)) {
            rowVals.push(parseFloat(token));
          } else {
            rowVals.push(token);
          }
        }

        while (pos < len && /\s/.test(sqlContent[pos]!)) pos++;
        if (sqlContent[pos] === ",") {
          pos++;
        }
      }

      const rowObj: Record<string, any> = {};
      for (let i = 0; i < columns.length; i++) {
        rowObj[columns[i]!] = rowVals[i];
      }
      tables[tableName].rows.push(rowObj);

      while (pos < len && /\s/.test(sqlContent[pos]!)) pos++;
      if (sqlContent[pos] === ",") {
        pos++;
      } else if (sqlContent[pos] === ";") {
        pos++;
        break;
      }
    }
  }

  return tables;
}

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const str = String(val).trim();
  // Format: 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DD HH:MM:SS.mmm'
  return new Date(str.includes("T") ? str : str.replace(" ", "T") + "Z");
}

function toOptDate(val: any): Date | null {
  if (!val) return null;
  return toDate(val);
}

function toBool(val: any): boolean {
  return val === 1 || val === true || val === "1" || val === "true";
}

async function runMigration() {
  console.log("===============================================================================");
  console.log("Altair Academy — MySQL to SQLite Data Migration");
  console.log("===============================================================================\n");

  const candidatePaths = [
    process.argv[2],
    path.resolve(process.cwd(), "altair_academy (2).sql"),
    path.resolve(process.cwd(), "..", "altair_academy (2).sql"),
    path.resolve(process.cwd(), "..", "backup_mysql", "altair_academy (2).sql"),
  ].filter(Boolean) as string[];

  let sqlPath = "";
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      sqlPath = p;
      break;
    }
  }

  if (!sqlPath) {
    console.error("❌ ERROR: Could not locate SQL dump file. Checked:", candidatePaths);
    process.exit(1);
  }

  console.log(`Loading SQL dump from: ${sqlPath}`);
  const sqlContent = fs.readFileSync(sqlPath, "utf8");
  console.log(`Parsing SQL dump (${(sqlContent.length / 1024).toFixed(1)} KB)...`);
  const tables = parseSqlDump(sqlContent);

  console.log("\nImporting records into SQLite via Prisma Client...\n");

  // 1. admin_users
  const adminUsers = tables["admin_users"]?.rows || [];
  console.log(`▶ Importing admin_users (${adminUsers.length} records)...`);
  for (const row of adminUsers) {
    await prisma.adminUser.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 2. categories
  const categories = tables["categories"]?.rows || [];
  console.log(`▶ Importing categories (${categories.length} records)...`);
  for (const row of categories) {
    await prisma.category.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        name: row.name,
        short: row.short,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        slug: row.slug,
        name: row.name,
        short: row.short,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 3. subcategories (Level 1: root subcategories without parentId)
  const subcategories = tables["subcategories"]?.rows || [];
  console.log(`▶ Importing subcategories (${subcategories.length} records)...`);
  const rootSubcats = subcategories.filter((s: any) => !s.parentId);
  const childSubcats = subcategories.filter((s: any) => s.parentId);

  for (const row of rootSubcats) {
    await prisma.subcategory.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        categoryId: row.categoryId,
        parentId: null,
        slug: row.slug,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        categoryId: row.categoryId,
        parentId: null,
        slug: row.slug,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  for (const row of childSubcats) {
    await prisma.subcategory.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        categoryId: row.categoryId,
        parentId: row.parentId,
        slug: row.slug,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        categoryId: row.categoryId,
        parentId: row.parentId,
        slug: row.slug,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 4. courses
  const courses = tables["courses"]?.rows || [];
  console.log(`▶ Importing courses (${courses.length} records)...`);
  for (const row of courses) {
    await prisma.course.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        image: row.image,
        categoryId: row.categoryId,
        subcategoryId: row.subcategoryId,
        level: row.level,
        duration: row.duration,
        price: row.price,
        summary: row.summary,
        objective: row.objective,
        content: row.content,
        whoShouldAttend: row.whoShouldAttend,
        prerequisites: row.prerequisites,
        certification: row.certification,
        notesAndEquipment: row.notesAndEquipment,
        classCapacity: row.classCapacity,
        feeDetails: row.feeDetails,
        courseSupport: row.courseSupport,
        courseNote: row.courseNote,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        ogImage: row.ogImage,
        isFeatured: toBool(row.isFeatured),
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        slug: row.slug,
        title: row.title,
        image: row.image,
        categoryId: row.categoryId,
        subcategoryId: row.subcategoryId,
        level: row.level,
        duration: row.duration,
        price: row.price,
        summary: row.summary,
        objective: row.objective,
        content: row.content,
        whoShouldAttend: row.whoShouldAttend,
        prerequisites: row.prerequisites,
        certification: row.certification,
        notesAndEquipment: row.notesAndEquipment,
        classCapacity: row.classCapacity,
        feeDetails: row.feeDetails,
        courseSupport: row.courseSupport,
        courseNote: row.courseNote,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        ogImage: row.ogImage,
        isFeatured: toBool(row.isFeatured),
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 5. calendar_courses
  const calendarCourses = tables["calendar_courses"]?.rows || [];
  console.log(`▶ Importing calendar_courses (${calendarCourses.length} records)...`);
  for (const row of calendarCourses) {
    await prisma.calendarCourse.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        code: row.code,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        code: row.code,
        name: row.name,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 6. calendar_sessions
  const calendarSessions = tables["calendar_sessions"]?.rows || [];
  console.log(`▶ Importing calendar_sessions (${calendarSessions.length} records)...`);
  for (const row of calendarSessions) {
    await prisma.calendarSession.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        courseId: row.courseId,
        kind: row.kind,
        level: row.level,
        startDate: row.startDate,
        endDate: row.endDate,
        timeLabel: row.timeLabel,
        location: row.location,
        note: row.note,
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        courseId: row.courseId,
        kind: row.kind,
        level: row.level,
        startDate: row.startDate,
        endDate: row.endDate,
        timeLabel: row.timeLabel,
        location: row.location,
        note: row.note,
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 7. team_members
  const teamMembers = tables["team_members"]?.rows || [];
  console.log(`▶ Importing team_members (${teamMembers.length} records)...`);
  for (const row of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        name: row.name,
        instructorName: row.instructorName,
        role: row.role,
        instructorRole: row.instructorRole,
        shortBio: row.shortBio,
        fullBio: row.fullBio,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        expertise: row.expertise || "[]",
        image: row.image,
        showInManagement: toBool(row.showInManagement),
        showInInstructors: toBool(row.showInInstructors),
        managementOrder: Number(row.managementOrder || 0),
        instructorOrder: Number(row.instructorOrder || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        slug: row.slug,
        name: row.name,
        instructorName: row.instructorName,
        role: row.role,
        instructorRole: row.instructorRole,
        shortBio: row.shortBio,
        fullBio: row.fullBio,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        expertise: row.expertise || "[]",
        image: row.image,
        showInManagement: toBool(row.showInManagement),
        showInInstructors: toBool(row.showInInstructors),
        managementOrder: Number(row.managementOrder || 0),
        instructorOrder: Number(row.instructorOrder || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 8. news_posts
  const newsPosts = tables["news_posts"]?.rows || [];
  console.log(`▶ Importing news_posts (${newsPosts.length} records)...`);
  for (const row of newsPosts) {
    await prisma.newsPost.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        body: row.body,
        kind: row.kind,
        category: row.category,
        tags: row.tags || "[]",
        image: row.image,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        ogImage: row.ogImage,
        publishedAt: toDate(row.publishedAt),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        body: row.body,
        kind: row.kind,
        category: row.category,
        tags: row.tags || "[]",
        image: row.image,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        ogImage: row.ogImage,
        publishedAt: toDate(row.publishedAt),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 9. faqs
  const faqs = tables["faqs"]?.rows || [];
  console.log(`▶ Importing faqs (${faqs.length} records)...`);
  for (const row of faqs) {
    await prisma.faq.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        question: row.question,
        answer: row.answer,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        question: row.question,
        answer: row.answer,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 10. job_openings
  const jobOpenings = tables["job_openings"]?.rows || [];
  console.log(`▶ Importing job_openings (${jobOpenings.length} records)...`);
  for (const row of jobOpenings) {
    await prisma.jobOpening.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        title: row.title,
        employmentType: row.employmentType,
        location: row.location,
        scope: row.scope,
        summary: row.summary,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        title: row.title,
        employmentType: row.employmentType,
        location: row.location,
        scope: row.scope,
        summary: row.summary,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 11. contact_details
  const contactDetails = tables["contact_details"]?.rows || [];
  console.log(`▶ Importing contact_details (${contactDetails.length} records)...`);
  for (const row of contactDetails) {
    await prisma.contactDetail.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        type: row.type,
        label: row.label,
        value: row.value,
        link: row.link,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        type: row.type,
        label: row.label,
        value: row.value,
        link: row.link,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 12. legal_pages
  const legalPages = tables["legal_pages"]?.rows || [];
  console.log(`▶ Importing legal_pages (${legalPages.length} records)...`);
  for (const row of legalPages) {
    await prisma.legalPage.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        body: row.body,
        showInFooter: toBool(row.showInFooter),
        isCore: toBool(row.isCore),
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        slug: row.slug,
        title: row.title,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        body: row.body,
        showInFooter: toBool(row.showInFooter),
        isCore: toBool(row.isCore),
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 13. testimonials
  const testimonials = tables["testimonials"]?.rows || [];
  console.log(`▶ Importing testimonials (${testimonials.length} records)...`);
  for (const row of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        quote: row.quote,
        name: row.name,
        company: row.company,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        quote: row.quote,
        name: row.name,
        company: row.company,
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 14. upcoming_intakes
  const upcomingIntakes = tables["upcoming_intakes"]?.rows || [];
  console.log(`▶ Importing upcoming_intakes (${upcomingIntakes.length} records)...`);
  for (const row of upcomingIntakes) {
    await prisma.upcomingIntake.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        title: row.title,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        points: row.points || "[]",
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        title: row.title,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        points: row.points || "[]",
        order: Number(row.order || 0),
        status: row.status,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 15. site_seos
  const siteSeos = tables["site_seos"]?.rows || [];
  console.log(`▶ Importing site_seos (${siteSeos.length} records)...`);
  for (const row of siteSeos) {
    await prisma.siteSeo.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        key: row.key || "default",
        siteName: row.siteName,
        defaultDescription: row.defaultDescription,
        defaultOgImage: row.defaultOgImage,
        twitterSite: row.twitterSite,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
      update: {
        key: row.key || "default",
        siteName: row.siteName,
        defaultDescription: row.defaultDescription,
        defaultOgImage: row.defaultOgImage,
        twitterSite: row.twitterSite,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      },
    });
  }

  // 16. login_attempts
  const loginAttempts = tables["login_attempts"]?.rows || [];
  console.log(`▶ Importing login_attempts (${loginAttempts.length} records)...`);
  for (const row of loginAttempts) {
    await prisma.loginAttempt.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        key: row.key,
        count: Number(row.count || 0),
        windowStart: toDate(row.windowStart),
      },
      update: {
        key: row.key,
        count: Number(row.count || 0),
        windowStart: toDate(row.windowStart),
      },
    });
  }

  // Check any additional tables if present in future dumps:
  // leads
  const leads = tables["leads"]?.rows || [];
  if (leads.length > 0) {
    console.log(`▶ Importing leads (${leads.length} records)...`);
    for (const row of leads) {
      await prisma.lead.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          message: row.message,
          status: row.status,
          source: row.source || "contact-page",
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
        update: {
          name: row.name,
          email: row.email,
          phone: row.phone,
          message: row.message,
          status: row.status,
          source: row.source || "contact-page",
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
      });
    }
  }

  // career_applications
  const careerApps = tables["career_applications"]?.rows || [];
  if (careerApps.length > 0) {
    console.log(`▶ Importing career_applications (${careerApps.length} records)...`);
    for (const row of careerApps) {
      await prisma.careerApplication.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          specialisation: row.specialisation,
          message: row.message,
          resumeOriginalName: row.resumeOriginalName,
          resumeStoredName: row.resumeStoredName,
          resumeMime: row.resumeMime,
          resumeSize: row.resumeSize ? Number(row.resumeSize) : null,
          status: row.status,
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
        update: {
          name: row.name,
          email: row.email,
          phone: row.phone,
          specialisation: row.specialisation,
          message: row.message,
          resumeOriginalName: row.resumeOriginalName,
          resumeStoredName: row.resumeStoredName,
          resumeMime: row.resumeMime,
          resumeSize: row.resumeSize ? Number(row.resumeSize) : null,
          status: row.status,
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
      });
    }
  }

  // newsletter_subscribers
  const subscribers = tables["newsletter_subscribers"]?.rows || [];
  if (subscribers.length > 0) {
    console.log(`▶ Importing newsletter_subscribers (${subscribers.length} records)...`);
    for (const row of subscribers) {
      await prisma.newsletterSubscriber.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          email: row.email,
          status: row.status,
          source: row.source || "footer",
          unsubscribeToken: row.unsubscribeToken,
          subscribedAt: toDate(row.subscribedAt),
          unsubscribedAt: toOptDate(row.unsubscribedAt),
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
        update: {
          email: row.email,
          status: row.status,
          source: row.source || "footer",
          unsubscribeToken: row.unsubscribeToken,
          subscribedAt: toDate(row.subscribedAt),
          unsubscribedAt: toOptDate(row.unsubscribedAt),
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
      });
    }
  }

  // page_seos
  const pageSeos = tables["page_seos"]?.rows || [];
  if (pageSeos.length > 0) {
    console.log(`▶ Importing page_seos (${pageSeos.length} records)...`);
    for (const row of pageSeos) {
      await prisma.pageSeo.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          pageKey: row.pageKey,
          title: row.title,
          description: row.description,
          ogTitle: row.ogTitle,
          ogDescription: row.ogDescription,
          ogImage: row.ogImage,
          noIndex: row.noIndex === null ? null : toBool(row.noIndex),
          canonicalPath: row.canonicalPath,
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
        update: {
          pageKey: row.pageKey,
          title: row.title,
          description: row.description,
          ogTitle: row.ogTitle,
          ogDescription: row.ogDescription,
          ogImage: row.ogImage,
          noIndex: row.noIndex === null ? null : toBool(row.noIndex),
          canonicalPath: row.canonicalPath,
          createdAt: toDate(row.createdAt),
          updatedAt: toDate(row.updatedAt),
        },
      });
    }
  }

  // migration_logs
  const migrationLogs = tables["migration_logs"]?.rows || [];
  if (migrationLogs.length > 0) {
    console.log(`▶ Importing migration_logs (${migrationLogs.length} records)...`);
    for (const row of migrationLogs) {
      await prisma.migrationLog.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          name: row.name,
          appliedAt: toDate(row.appliedAt),
        },
        update: {
          name: row.name,
          appliedAt: toDate(row.appliedAt),
        },
      });
    }
  }

  console.log("\n===============================================================================");
  console.log("POST-MIGRATION VERIFICATION AUDIT");
  console.log("===============================================================================");

  const verifications = [
    { name: "admin_users", expected: adminUsers.length, actual: await prisma.adminUser.count() },
    { name: "categories", expected: categories.length, actual: await prisma.category.count() },
    {
      name: "subcategories",
      expected: subcategories.length,
      actual: await prisma.subcategory.count(),
    },
    { name: "courses", expected: courses.length, actual: await prisma.course.count() },
    {
      name: "calendar_courses",
      expected: calendarCourses.length,
      actual: await prisma.calendarCourse.count(),
    },
    {
      name: "calendar_sessions",
      expected: calendarSessions.length,
      actual: await prisma.calendarSession.count(),
    },
    { name: "team_members", expected: teamMembers.length, actual: await prisma.teamMember.count() },
    { name: "news_posts", expected: newsPosts.length, actual: await prisma.newsPost.count() },
    { name: "faqs", expected: faqs.length, actual: await prisma.faq.count() },
    { name: "job_openings", expected: jobOpenings.length, actual: await prisma.jobOpening.count() },
    {
      name: "contact_details",
      expected: contactDetails.length,
      actual: await prisma.contactDetail.count(),
    },
    { name: "legal_pages", expected: legalPages.length, actual: await prisma.legalPage.count() },
    {
      name: "testimonials",
      expected: testimonials.length,
      actual: await prisma.testimonial.count(),
    },
    {
      name: "upcoming_intakes",
      expected: upcomingIntakes.length,
      actual: await prisma.upcomingIntake.count(),
    },
    { name: "site_seos", expected: siteSeos.length, actual: await prisma.siteSeo.count() },
    {
      name: "login_attempts",
      expected: loginAttempts.length,
      actual: await prisma.loginAttempt.count(),
    },
    { name: "leads", expected: leads.length, actual: await prisma.lead.count() },
    {
      name: "career_applications",
      expected: careerApps.length,
      actual: await prisma.careerApplication.count(),
    },
    {
      name: "newsletter_subscribers",
      expected: subscribers.length,
      actual: await prisma.newsletterSubscriber.count(),
    },
    { name: "page_seos", expected: pageSeos.length, actual: await prisma.pageSeo.count() },
    {
      name: "migration_logs",
      expected: migrationLogs.length,
      actual: await prisma.migrationLog.count(),
    },
  ];

  let hasDiscrepancy = false;
  console.log(
    `${"Table Name".padEnd(25)} | ${"Expected (SQL)".padStart(14)} | ${"Migrated (SQLite)".padStart(17)} | Status`,
  );
  console.log("-".repeat(75));

  for (const v of verifications) {
    const match = v.expected === v.actual;
    if (!match) hasDiscrepancy = true;
    console.log(
      `${v.name.padEnd(25)} | ${String(v.expected).padStart(14)} | ${String(v.actual).padStart(17)} | ${
        match ? "✔ MATCH" : "❌ MISMATCH"
      }`,
    );
  }

  console.log("===============================================================================");
  if (hasDiscrepancy) {
    console.error("❌ FAILED: Data discrepancy detected during verification audit.");
    process.exit(1);
  } else {
    console.log("✔ SUCCESS: All 21 application tables verified with 100% record integrity!");
  }
}

runMigration()
  .catch((err) => {
    console.error("❌ Migration failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
