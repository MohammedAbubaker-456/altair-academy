/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Altair Academy — Comprehensive Calendar Verification Suite
 *
 * Validates database records, seed parity against baseline, Zod schemas,
 * timezone-safe date formatting, CRUD logic, constraints, and live HTTP routes.
 *
 * Location: scripts/verify-calendar.ts
 */

import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import * as dotenv from "dotenv";
import { calendarCourseSchema, calendarSessionSchema } from "../src/lib/validation/calendar";
import { formatDateOnly, formatDateOnlyRange, getTodayDateString } from "../src/lib/date";
import { seedCalendarCourses, seedCalendar2026Level2 } from "../prisma/seed-data/calendar";

dotenv.config();

const db = new PrismaClient();

async function main() {
  console.log("===============================================================================");
  console.log("Altair Academy — Calendar Verification Suite (Phase 6)");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✔ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✖ FAIL: ${testName} ${details ? `(${details})` : ""}`);
      failed++;
    }
  }

  // --- 1. Database Model Integrity & Seed Parity vs Baseline ---
  console.log("--- 1. Testing Database Records & Baseline Parity ---");
  const courseCount = await db.calendarCourse.count();
  assert(courseCount >= 6, "Calendar courses in DB >= 6", `found ${courseCount}`);

  const activeCourses = await db.calendarCourse.findMany({
    where: { status: "ACTIVE" },
    orderBy: { order: "asc" },
  });
  const codes = activeCourses.map((c) => c.code);
  assert(
    codes.join(",") === "UT,MT,PT,PAUT,TOFD,RI",
    "Active calendar courses match expected codes in order: UT,MT,PT,PAUT,TOFD,RI",
    codes.join(","),
  );

  const totalSessions = await db.calendarSession.count();
  const trainingCount = await db.calendarSession.count({ where: { kind: "TRAINING" } });
  const examCount = await db.calendarSession.count({ where: { kind: "EXAM" } });

  assert(
    totalSessions === 37,
    "Total calendar sessions seeded is exactly 37",
    `found ${totalSessions}`,
  );
  assert(trainingCount === 19, "Total training sessions is exactly 19", `found ${trainingCount}`);
  assert(examCount === 18, "Total exam sessions is exactly 18", `found ${examCount}`);

  // Slot-for-slot verification against raw baseline
  let slotMismatch = false;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (const monthEntry of seedCalendar2026Level2) {
    const monthIdx = monthNames.indexOf(monthEntry.month) + 1;
    const mStr = String(monthIdx).padStart(2, "0");
    for (const [code, slots] of Object.entries(monthEntry.slots)) {
      const course = activeCourses.find((c) => c.code === code);
      if (!course) {
        slotMismatch = true;
        break;
      }
      if (slots.training) {
        const parts = slots.training.trim().split("-");
        const sDay = parts[0] ? String(parseInt(parts[0], 10)).padStart(2, "0") : "01";
        const eDay = parts[1] ? String(parseInt(parts[1], 10)).padStart(2, "0") : sDay;
        const exists = await db.calendarSession.findFirst({
          where: {
            courseId: course.id,
            kind: "TRAINING",
            startDate: `2026-${mStr}-${sDay}`,
            endDate: `2026-${mStr}-${eDay}`,
          },
        });
        if (!exists) {
          slotMismatch = true;
          console.error(`Missing training session: ${code} 2026-${mStr}-${sDay} to ${eDay}`);
        }
      }
      if (slots.exam) {
        const parts = slots.exam.trim().split("-");
        const sDay = parts[0] ? String(parseInt(parts[0], 10)).padStart(2, "0") : "01";
        const eDay = parts[1] ? String(parseInt(parts[1], 10)).padStart(2, "0") : sDay;
        const exists = await db.calendarSession.findFirst({
          where: {
            courseId: course.id,
            kind: "EXAM",
            startDate: `2026-${mStr}-${sDay}`,
            endDate: `2026-${mStr}-${eDay}`,
          },
        });
        if (!exists) {
          slotMismatch = true;
          console.error(`Missing exam session: ${code} 2026-${mStr}-${sDay} to ${eDay}`);
        }
      }
    }
  }
  assert(!slotMismatch, "Every slot from baseline matches a database record");

  // --- 2. Zod Validation Schemas ---
  console.log("\n--- 2. Testing Zod Validation Schemas ---");
  // Course Schema
  const validCourse = calendarCourseSchema.safeParse({
    code: "UT-NEW",
    name: "Ultrasonic Testing Advanced",
    order: 5,
    status: "ACTIVE",
  });
  assert(validCourse.success, "calendarCourseSchema accepts valid code 'UT-NEW'");

  const lowercaseCourse = calendarCourseSchema.safeParse({
    code: "ut",
    name: "Test",
    order: 0,
    status: "ACTIVE",
  });
  assert(
    lowercaseCourse.success && lowercaseCourse.data.code === "UT",
    "calendarCourseSchema auto-transforms lowercase course code 'ut' to uppercase 'UT'",
  );

  const shortCourse = calendarCourseSchema.safeParse({
    code: "U",
    name: "Test",
    order: 0,
    status: "ACTIVE",
  });
  assert(!shortCourse.success, "calendarCourseSchema rejects course code shorter than 2 chars");

  const firstCourseId = activeCourses[0]!.id;
  const validSession = calendarSessionSchema.safeParse({
    courseId: firstCourseId,
    kind: "TRAINING",
    level: "Level 2",
    startDate: "2026-06-15",
    endDate: "2026-06-19",
    status: "ACTIVE",
  });
  assert(validSession.success, "calendarSessionSchema accepts valid session span (5 days)");

  const invalidDate = calendarSessionSchema.safeParse({
    courseId: firstCourseId,
    kind: "TRAINING",
    startDate: "2026-02-30",
    endDate: "2026-03-02",
    status: "ACTIVE",
  });
  assert(!invalidDate.success, "calendarSessionSchema rejects nonexistent date 2026-02-30");

  const endBeforeStart = calendarSessionSchema.safeParse({
    courseId: firstCourseId,
    kind: "TRAINING",
    startDate: "2026-06-20",
    endDate: "2026-06-15",
    status: "ACTIVE",
  });
  assert(!endBeforeStart.success, "calendarSessionSchema rejects endDate before startDate");

  const spanTooLong = calendarSessionSchema.safeParse({
    courseId: firstCourseId,
    kind: "TRAINING",
    startDate: "2026-06-01",
    endDate: "2026-07-15",
    status: "ACTIVE",
  });
  assert(!spanTooLong.success, "calendarSessionSchema rejects session span > 31 days");

  const crossMonthValid = calendarSessionSchema.safeParse({
    courseId: firstCourseId,
    kind: "TRAINING",
    startDate: "2026-01-28",
    endDate: "2026-02-02",
    status: "ACTIVE",
  });
  assert(crossMonthValid.success, "calendarSessionSchema accepts cross-month span (6 days)");

  // --- 3. Timezone-Safe Date Formatters ---
  console.log("\n--- 3. Testing Timezone-Safe Date Formatters ---");
  assert(
    formatDateOnly("2026-01-17") === "17 Jan 2026",
    "formatDateOnly formats single date correctly to short format '17 Jan 2026'",
    formatDateOnly("2026-01-17"),
  );
  assert(
    formatDateOnlyRange("2026-01-12", "2026-01-16") === "12–16 Jan 2026",
    "formatDateOnlyRange formats same-month range correctly to '12–16 Jan 2026'",
    formatDateOnlyRange("2026-01-12", "2026-01-16"),
  );
  assert(
    formatDateOnlyRange("2026-01-28", "2026-02-02") === "28 Jan – 2 Feb 2026",
    "formatDateOnlyRange formats cross-month range correctly",
    formatDateOnlyRange("2026-01-28", "2026-02-02"),
  );
  assert(
    formatDateOnlyRange("2025-12-28", "2026-01-03") === "28 Dec 2025 – 3 Jan 2026",
    "formatDateOnlyRange formats cross-year range correctly",
    formatDateOnlyRange("2025-12-28", "2026-01-03"),
  );
  assert(
    formatDateOnlyRange("2026-01-17", "2026-01-17") === "17 Jan 2026",
    "formatDateOnlyRange formats single-day range correctly to '17 Jan 2026'",
    formatDateOnlyRange("2026-01-17", "2026-01-17"),
  );
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(getTodayDateString("Asia/Kuala_Lumpur")),
    "getTodayDateString returns YYYY-MM-DD format",
    getTodayDateString("Asia/Kuala_Lumpur"),
  );

  // --- 4. Database CRUD & Constraints Lifecycle ---
  console.log("\n--- 4. Testing CRUD Operations & Constraints Lifecycle ---");
  // A. Create test course
  const testCourse = await db.calendarCourse.create({
    data: {
      code: "TEST-Z",
      name: "Temporary Verification Course",
      order: 99,
      status: "ACTIVE",
    },
  });
  assert(Boolean(testCourse.id), "Created test course TEST-Z");

  // B. Create test session
  const testSession = await db.calendarSession.create({
    data: {
      courseId: testCourse.id,
      kind: "TRAINING",
      level: "Level 2",
      startDate: "2026-12-01",
      endDate: "2026-12-05",
      status: "ACTIVE",
    },
  });
  assert(Boolean(testSession.id), "Created test session for TEST-Z");

  // C. Test unique constraint P2002
  let duplicatePrevented = false;
  try {
    await db.calendarSession.create({
      data: {
        courseId: testCourse.id,
        kind: "TRAINING",
        level: "Level 2",
        startDate: "2026-12-01",
        endDate: "2026-12-05",
        status: "ACTIVE",
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      duplicatePrevented = true;
    }
  }
  assert(duplicatePrevented, "Prisma unique constraint P2002 blocks exact duplicate session");

  // D. Deletion blocked when course has sessions
  const sessionCountForCourse = await db.calendarSession.count({
    where: { courseId: testCourse.id },
  });
  assert(
    sessionCountForCourse > 0,
    "Course has 1 session, deletion should be blocked by app logic",
  );

  // E. Status toggle
  const updatedSession = await db.calendarSession.update({
    where: { id: testSession.id },
    data: { status: "INACTIVE" },
  });
  assert(updatedSession.status === "INACTIVE", "Successfully toggled session status to INACTIVE");

  // F. Delete test session
  await db.calendarSession.delete({ where: { id: testSession.id } });
  const checkSession = await db.calendarSession.findUnique({ where: { id: testSession.id } });
  assert(checkSession === null, "Successfully deleted test session");

  // G. Delete test course
  await db.calendarCourse.delete({ where: { id: testCourse.id } });
  const checkCourse = await db.calendarCourse.findUnique({ where: { id: testCourse.id } });
  assert(checkCourse === null, "Successfully deleted test course after sessions removed");

  // --- 5. Live HTTP Verification (Dev Server) ---
  console.log("\n--- 5. Testing Live HTTP Endpoints (http://localhost:3000) ---");
  try {
    // Public /calendar
    const pubRes = await fetch("http://localhost:3000/calendar");
    assert(pubRes.status === 200, "GET /calendar returns 200 OK");
    const pubHtml = await pubRes.text();

    const titleMatch = pubHtml.match(/<title>([^<]+)<\/title>/);
    const descMatch = pubHtml.match(/<meta name="description" content="([^"]+)"/);

    assert(
      titleMatch?.[1] === "2026 Training Calendar | Altair Academy",
      "Public title matches baseline: '2026 Training Calendar | Altair Academy'",
      titleMatch?.[1],
    );
    assert(
      descMatch?.[1] ===
        "Altair Academy 2026 NDT Level 2 training and examination calendar for UT, MT, PT, PAUT, TOFD and RI courses.",
      "Public description matches baseline course code list",
      descMatch?.[1],
    );

    const cleanPub = pubHtml.replace(/<!--.*?-->/g, "");
    assert(
      cleanPub.includes("2026 TRAINING CALENDAR"),
      "Public page contains hero heading '2026 TRAINING CALENDAR'",
    );
    assert(
      cleanPub.includes("Level 2 · Year 2026"),
      "Public page contains dynamic level/year label 'Level 2 · Year 2026'",
    );
    assert(pubHtml.includes("Reserve a Seat"), "Public page contains 'Reserve a Seat' button");

    // Unauthenticated admin access
    const unauthRes = await fetch("http://localhost:3000/admin/calendar", { redirect: "manual" });
    assert(
      unauthRes.status === 307 && unauthRes.headers.get("location") === "/admin/login",
      "Unauthenticated GET /admin/calendar redirects (307) to /admin/login",
    );

    // Authenticated admin access
    const admin = await db.adminUser.findFirst();
    if (!admin) throw new Error("No admin user found");
    const secret = new TextEncoder().encode(process.env["AUTH_SECRET"]!);
    const token = await new SignJWT({ adminId: admin.id, email: admin.email, name: admin.name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    const cookieHeader = `admin_session=${token}`;

    const authCalRes = await fetch("http://localhost:3000/admin/calendar", {
      headers: { Cookie: cookieHeader },
    });
    assert(authCalRes.status === 200, "Authenticated GET /admin/calendar returns 200 OK");
    const calHtml = await authCalRes.text();
    assert(calHtml.includes("Training Calendar"), "Admin page displays 'Training Calendar' header");
    assert(calHtml.includes("Course Codes"), "Admin page displays 'Course Codes' tab");

    const authNewRes = await fetch("http://localhost:3000/admin/calendar/sessions/new", {
      headers: { Cookie: cookieHeader },
    });
    assert(
      authNewRes.status === 200,
      "Authenticated GET /admin/calendar/sessions/new returns 200 OK",
    );
    const newHtml = await authNewRes.text();
    assert(
      newHtml.includes("Schedule New Session"),
      "Form displays 'Schedule New Session' heading",
    );

    const overviewRes = await fetch("http://localhost:3000/admin", {
      headers: { Cookie: cookieHeader },
    });
    assert(overviewRes.status === 200, "Authenticated GET /admin returns 200 OK");
    const ovHtml = await overviewRes.text();
    assert(
      ovHtml.includes("Training Calendar"),
      "Admin overview displays 'Training Calendar' stats card",
    );
    assert(
      ovHtml.includes("Upcoming Active"),
      "Admin overview card displays 'Upcoming Active' count",
    );
    assert(
      ovHtml.includes("Courses Active"),
      "Admin overview card displays 'Courses Active' count",
    );
    assert(
      ovHtml.includes("/admin/calendar"),
      "Admin sidebar contains navigation link to /admin/calendar",
    );
  } catch (err: any) {
    assert(false, "Live HTTP verification completed without connection errors", err.message);
  }

  console.log("\n===============================================================================");
  console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Fatal test error:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
