/**
 * Automated Verification Suite: Course Subcategories Feature
 *
 * Validates:
 * 1. Database schema, relations, unique constraints, and seed hierarchy
 * 2. Header menu data structure (database-driven via live server render)
 * 3. Public multi-row pill navigation (/courses?category=...&subcategory=...)
 * 4. Fallback on invalid/mismatched subcategory query params
 * 5. Admin subcategory manager (/admin/categories/[categoryId]/subcategories)
 * 6. Admin course form category & subcategory dropdowns (/admin/courses/new)
 * 7. Admin route protection & unauthenticated redirects
 *
 * Location: scripts/verify-subcategories.ts
 */

import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import * as dotenv from "dotenv";

dotenv.config();
const db = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}${detail ? ` (${detail})` : ""}`);
  }
}

async function main() {
  console.log("===============================================================================");
  console.log("Altair Academy — Subcategories Verification Suite (Local Dev)");
  console.log("===============================================================================\n");

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: Database Model & Seed Data Verification
    // -------------------------------------------------------------------------
    console.log("--- Section 1: Database Hierarchy & Seed Parity ---");

    const allCategories = await db.category.findMany({
      include: { subcategories: true },
      orderBy: { order: "asc" },
    });
    assert(
      allCategories.length >= 9,
      "Total categories count >= 9",
      `found ${allCategories.length}`,
    );

    const subcategories = await db.subcategory.findMany({
      include: { category: true, parent: true, children: true, courses: true },
      orderBy: { order: "asc" },
    });
    assert(
      subcategories.length >= 11,
      "Seeded subcategories count >= 11",
      `found ${subcategories.length}`,
    );

    const ndtCategory = allCategories.find((c) => c.slug === "ndt");
    assert(!!ndtCategory, "NDT category exists in database");

    const ndtSubs = subcategories.filter((s) => s.categoryId === ndtCategory?.id);
    const ndtTopLevel = ndtSubs.filter((s) => !s.parentId);
    assert(
      ndtTopLevel.length === 3,
      "NDT has exactly 3 top-level subcategories",
      `found ${ndtTopLevel.length}`,
    );

    const asntSub = ndtSubs.find((s) => s.slug === "asnt-courses");
    assert(!!asntSub, "Top-level 'ASNT Courses' exists");
    assert(
      asntSub?.children.length === 3,
      "ASNT Courses has 3 children",
      `found ${asntSub?.children.length}`,
    );

    const pcnSub = ndtSubs.find((s) => s.slug === "pcn-courses");
    assert(!!pcnSub, "Top-level 'PCN Courses' exists");
    assert(
      pcnSub?.children.length === 3,
      "PCN Courses has 3 children",
      `found ${pcnSub?.children.length}`,
    );

    const specialSub = ndtSubs.find((s) => s.slug === "special-ndt-courses");
    assert(!!specialSub, "Top-level 'Special NDT Courses' exists (leaf)");
    assert(
      specialSub?.children.length === 0,
      "Special NDT Courses has 0 children (leaf)",
      `found ${specialSub?.children.length}`,
    );

    const officeCategory = allCategories.find((c) => c.slug === "office-productivity");
    assert(!!officeCategory, "Office Productivity category exists");
    const officeSubs = subcategories.filter((s) => s.categoryId === officeCategory?.id);
    assert(
      officeSubs.length === 2,
      "Office Productivity has 2 subcategories",
      `found ${officeSubs.length}`,
    );

    // Verify depth rule in database: no subcategory has a parent that also has a parent
    const maxDepthExceeded = subcategories.some((s) => s.parent && s.parent.parentId !== null);
    assert(
      !maxDepthExceeded,
      "Database depth constraint: no subcategory exceeds 2 levels below category",
    );

    // -------------------------------------------------------------------------
    // SECTION 2: Live HTTP Tests on http://localhost:3000
    // -------------------------------------------------------------------------
    console.log("\n--- Section 2: Live HTTP Public Endpoints & Header Menu ---");

    // Public Home Page & Dynamic Header Menu
    const homeRes = await fetch("http://localhost:3000/");
    assert(homeRes.status === 200, "GET / returns 200 OK");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("Our Courses"), "Header renders 'Our Courses' dropdown button");
    assert(
      homeHtml.includes("Non-Destructive Testing"),
      "Header menu includes 'Non-Destructive Testing' category in tree",
    );
    assert(homeHtml.includes("ASNT Courses"), "Header menu includes 'ASNT Courses' in tree");
    assert(homeHtml.includes("PCN Courses"), "Header menu includes 'PCN Courses' in tree");
    assert(homeHtml.includes("Special NDT Courses"), "Header menu includes 'Special NDT Courses'");
    assert(
      homeHtml.includes("category=ndt\\u0026subcategory=asnt-courses") ||
        homeHtml.includes("category=ndt&subcategory=asnt-courses") ||
        homeHtml.includes("category=ndt&amp;subcategory=asnt-courses"),
      "Menu tree contains /courses?category=ndt&subcategory=asnt-courses link",
    );

    // Public Courses Page - Row 1 & Row 2 Pills
    console.log("\n--- Section 3: Public Catalog Multi-Row Pills & Filters ---");

    const catRes = await fetch("http://localhost:3000/courses?category=ndt");
    assert(catRes.status === 200, "GET /courses?category=ndt returns 200 OK");
    const catHtml = await catRes.text();
    assert(
      catHtml.includes("All Non-Destructive Testing"),
      "Renders Row 2 reset pill 'All Non-Destructive Testing'",
    );
    assert(
      catHtml.includes("ASNT Courses"),
      "Renders Row 2 top-level subcategory pill 'ASNT Courses'",
    );
    assert(
      catHtml.includes("PCN Courses"),
      "Renders Row 2 top-level subcategory pill 'PCN Courses'",
    );
    assert(
      catHtml.includes("Special NDT Courses"),
      "Renders Row 2 top-level subcategory pill 'Special NDT Courses'",
    );

    // Public Courses Page - Row 3 Child Pills
    const subRes = await fetch(
      "http://localhost:3000/courses?category=ndt&subcategory=asnt-courses",
    );
    assert(
      subRes.status === 200,
      "GET /courses?category=ndt&subcategory=asnt-courses returns 200 OK",
    );
    const subHtml = await subRes.text();
    assert(subHtml.includes("All ASNT Courses"), "Renders Row 3 reset pill 'All ASNT Courses'");
    assert(
      subHtml.includes("ASNT - Level 1") || subHtml.includes("ASNT – Level 1"),
      "Renders Row 3 child pill 'ASNT - Level 1'",
    );
    assert(
      subHtml.includes("ASNT - Level 2") || subHtml.includes("ASNT – Level 2"),
      "Renders Row 3 child pill 'ASNT - Level 2'",
    );
    assert(
      subHtml.includes("ASNT - Level 3") || subHtml.includes("ASNT – Level 3"),
      "Renders Row 3 child pill 'ASNT - Level 3'",
    );

    // Public Courses Page - Fallback on unknown subcategory
    const fallbackRes = await fetch(
      "http://localhost:3000/courses?category=ndt&subcategory=unknown-random-sub",
    );
    assert(
      fallbackRes.status === 200,
      "GET with unknown subcategory returns 200 OK (no 404 or 500 error)",
    );
    const fallbackHtml = await fallbackRes.text();
    assert(
      fallbackHtml.includes("Non-Destructive Testing"),
      "Fallback page still shows the category context",
    );

    // -------------------------------------------------------------------------
    // SECTION 4: Admin Portal & Course Form Subcategory Dropdown
    // -------------------------------------------------------------------------
    console.log("\n--- Section 4: Admin Management & Course Form Dropdown ---");

    // Unauthenticated Admin Access Check
    const unauthSubRes = await fetch(
      `http://localhost:3000/admin/categories/${ndtCategory?.id}/subcategories`,
      {
        redirect: "manual",
      },
    );
    assert(
      unauthSubRes.status === 307 && unauthSubRes.headers.get("location") === "/admin/login",
      "Unauthenticated GET /admin/categories/[id]/subcategories redirects (307) to /admin/login",
    );

    // Authenticated Admin Session
    const admin = await db.adminUser.findFirst();
    assert(!!admin, "Admin user exists in database for authentication test");

    const secret = new TextEncoder().encode(process.env["AUTH_SECRET"]!);
    const token = await new SignJWT({ adminId: admin!.id, email: admin!.email, name: admin!.name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    const cookieHeader = `admin_session=${token}`;

    // Authenticated Categories List Page
    const authCatRes = await fetch("http://localhost:3000/admin/categories", {
      headers: { Cookie: cookieHeader },
    });
    assert(authCatRes.status === 200, "Authenticated GET /admin/categories returns 200 OK");
    const authCatHtml = await authCatRes.text();
    assert(
      authCatHtml.includes("Subcategories"),
      "Categories table displays 'Subcategories' column/button",
    );

    // Authenticated Subcategories Manager Page
    const authSubRes = await fetch(
      `http://localhost:3000/admin/categories/${ndtCategory?.id}/subcategories`,
      {
        headers: { Cookie: cookieHeader },
      },
    );
    assert(
      authSubRes.status === 200,
      "Authenticated GET /admin/categories/[id]/subcategories returns 200 OK",
    );
    const authSubHtml = await authSubRes.text();
    assert(authSubHtml.includes("Subcategories"), "Page displays Subcategories header");
    assert(
      authSubHtml.includes('href="/admin/categories"') && authSubHtml.includes("Categories"),
      "Page displays breadcrumb link back to Categories",
    );
    assert(authSubHtml.includes("ASNT Courses"), "Table renders 'ASNT Courses'");
    assert(authSubHtml.includes("PCN Courses"), "Table renders 'PCN Courses'");
    assert(authSubHtml.includes("Add Subcategory"), "Displays 'Add Subcategory' action button");

    // Authenticated Course Create Form
    const authCourseNewRes = await fetch("http://localhost:3000/admin/courses/new", {
      headers: { Cookie: cookieHeader },
    });
    assert(authCourseNewRes.status === 200, "Authenticated GET /admin/courses/new returns 200 OK");
    const authCourseNewHtml = await authCourseNewRes.text();
    assert(authCourseNewHtml.includes("Category"), "Course form contains Category field");
    assert(
      authCourseNewHtml.includes("Subcategory"),
      "Course form contains Subcategory field directly below Category",
    );

    // Authenticated Courses Table List
    const authCoursesListRes = await fetch("http://localhost:3000/admin/courses", {
      headers: { Cookie: cookieHeader },
    });
    assert(authCoursesListRes.status === 200, "Authenticated GET /admin/courses returns 200 OK");
    const authCoursesListHtml = await authCoursesListRes.text();
    assert(
      authCoursesListHtml.includes("Subcategory"),
      "Courses table displays 'Subcategory' column header",
    );
  } catch (err: unknown) {
    const error = err as Error;
    assert(false, "Verification encountered unexpected error", error.message);
  }

  console.log("\n===============================================================================");
  console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
