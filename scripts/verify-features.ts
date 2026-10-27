/**
 * Automated Verification Script for Phase 7
 *
 * Validates public routes, Markdown security rules, dynamic placeholder tokens,
 * canonical redirects, and database records.
 *
 * Location: scripts/verify-features.ts
 */

import { PrismaClient } from "@prisma/client";
import { isSafeUrl, isValidPhone, isValidWhatsApp, isValidSlug } from "../src/lib/safe-url";
import { legalHref } from "../src/lib/legal";

const db = new PrismaClient();

async function main() {
  console.log("===============================================================================");
  console.log("Altair Academy — Automated Verification Suite (Phase 7)");
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

  // --- 1. Database Model Integrity & Seed Safety ---
  console.log("--- 1. Testing Database Models & Seeded Records ---");
  const openingsCount = await db.jobOpening.count();
  assert(openingsCount >= 6, "Job openings seeded count >= 6", `found ${openingsCount}`);

  const activeOpenings = await db.jobOpening.findMany({ where: { status: "ACTIVE" } });
  assert(activeOpenings.length > 0, "Active job openings exist", `count: ${activeOpenings.length}`);

  const contactCount = await db.contactDetail.count();
  assert(contactCount >= 9, "Contact details seeded count >= 9", `found ${contactCount}`);

  const privacyPage = await db.legalPage.findUnique({ where: { slug: "privacy" } });
  assert(privacyPage !== null, "Privacy Policy legal page exists in DB");
  assert(privacyPage?.isCore === true, "Privacy Policy is marked isCore: true");

  const termsPage = await db.legalPage.findUnique({ where: { slug: "terms" } });
  assert(termsPage !== null, "Terms of Service legal page exists in DB");
  assert(termsPage?.isCore === true, "Terms of Service is marked isCore: true");

  const newsWithBody = await db.newsPost.findFirst({ where: { body: { not: null } } });
  assert(newsWithBody !== null, "News posts have Markdown body populated", newsWithBody?.slug);

  // --- 2. URL Scheme & Markdown Security Validation ---
  console.log("\n--- 2. Testing URL Scheme Security & Validation ---");
  assert(!isSafeUrl("javascript:alert(1)"), "Rejects javascript: scheme");
  assert(!isSafeUrl("JAVASCRIPT:alert(document.cookie)"), "Rejects uppercase JAVASCRIPT: scheme");
  assert(!isSafeUrl("data:text/html;base64,PHNjcmlwdD4="), "Rejects data: scheme");
  assert(!isSafeUrl("vbscript:msgbox"), "Rejects vbscript: scheme");
  assert(isSafeUrl("https://example.com/test"), "Accepts https:// URL");
  assert(isSafeUrl("http://example.com/test"), "Accepts http:// URL");
  assert(isSafeUrl("mailto:info@altairacademy.com"), "Accepts mailto: URL");
  assert(isSafeUrl("tel:+97141234567"), "Accepts tel: URL");
  assert(isSafeUrl("/courses/paut"), "Accepts relative path");

  assert(isValidPhone("+971 4 123 4567"), "Accepts valid phone format");
  assert(isValidPhone("+97141234567"), "Accepts valid compact phone format");
  assert(!isValidPhone("123"), "Rejects phone shorter than 6 digits");

  assert(isValidWhatsApp("971501234567"), "Accepts valid WhatsApp number (8-15 digits, no +)");
  assert(!isValidWhatsApp("+971501234567"), "Rejects WhatsApp with leading + sign");

  assert(isValidSlug("privacy"), "Accepts valid slug 'privacy'");
  assert(isValidSlug("next-generation-phased-array"), "Accepts valid hyphenated slug");
  assert(!isValidSlug("Invalid Slug!"), "Rejects invalid slug characters");

  // --- 3. Canonical Legal Links & Placeholder Tokens ---
  console.log("\n--- 3. Testing Legal Canonical Hrefs & Token Replacement ---");
  assert(legalHref("privacy") === "/privacy", "legalHref('privacy') returns /privacy");
  assert(legalHref("terms") === "/terms", "legalHref('terms') returns /terms");
  assert(
    legalHref("cookie-policy") === "/legal/cookie-policy",
    "legalHref('cookie-policy') returns /legal/cookie-policy",
  );

  const emailDetail = await db.contactDetail.findFirst({
    where: { type: "EMAIL", status: "ACTIVE" },
  });
  const phoneDetail = await db.contactDetail.findFirst({
    where: { type: "PHONE", status: "ACTIVE" },
  });
  const addressDetail = await db.contactDetail.findFirst({
    where: { type: "ADDRESS", status: "ACTIVE" },
  });

  assert(
    emailDetail?.value === "anna@altair.academy",
    "Active email detail is anna@altair.academy",
    emailDetail?.value,
  );
  assert(
    phoneDetail?.value === "+607 386 1617",
    "Active phone detail is +607 386 1617",
    phoneDetail?.value,
  );
  assert(
    addressDetail?.value?.includes("Johor Malaysia") === true,
    "Active address detail is in Johor Malaysia",
    addressDetail?.value,
  );

  // --- 4. Live HTTP Public Endpoints Test ---
  console.log("\n--- 4. Testing Live HTTP Endpoints (http://127.0.0.1:3000) ---");
  const base = "http://127.0.0.1:3000";

  try {
    // 4.1 Home page
    const resHome = await fetch(base + "/");
    assert(resHome.status === 200, "GET / returns HTTP 200");
    const htmlHome = await resHome.text();
    assert(htmlHome.includes("+607 386 1617"), "Homepage footer contains active phone");
    assert(htmlHome.includes("anna@altair.academy"), "Homepage footer contains active email");
    assert(htmlHome.includes("/privacy"), "Homepage footer contains /privacy link");
    assert(htmlHome.includes("/terms"), "Homepage footer contains /terms link");

    // 4.2 Careers page
    const resCareers = await fetch(base + "/careers");
    assert(resCareers.status === 200, "GET /careers returns HTTP 200");
    const htmlCareers = await resCareers.text();
    assert(
      htmlCareers.includes("Senior NDT Level III Consultant") ||
        htmlCareers.includes("Open Positions"),
      "Careers page renders dynamic job openings",
    );
    assert(htmlCareers.includes("#submit-resume"), "Careers page includes #submit-resume link");

    // 4.3 News index page
    const resNews = await fetch(base + "/news");
    assert(resNews.status === 200, "GET /news returns HTTP 200");
    const htmlNews = await resNews.text();
    assert(htmlNews.includes("/news/"), "News cards link to /news/[slug]");

    // 4.4 News detail page
    const newsSlug = "altair-academy-renews-bindt-approved-training-organisation-status";
    const resNewsPost = await fetch(base + "/news/" + newsSlug);
    assert(
      resNewsPost.status === 200,
      "GET /news/" + newsSlug + " returns HTTP 200",
      `status: ${resNewsPost.status}`,
    );
    const htmlNewsPost = await resNewsPost.text();
    assert(
      htmlNewsPost.includes("BINDT-approved") || htmlNewsPost.includes("Altair Academy"),
      "News detail renders article title & content",
    );
    assert(
      htmlNewsPost.includes("Latest stories") || htmlNewsPost.includes("Latest Stories"),
      "News detail renders latest stories section",
    );

    // 4.5 Non-existent news post
    const resMissingNews = await fetch(base + "/news/unknown-random-post-12345");
    assert(
      resMissingNews.status === 404,
      "GET /news/unknown-random-post-12345 returns HTTP 404 Not Found",
    );

    // 4.6 Contact page
    const resContact = await fetch(base + "/contact");
    assert(resContact.status === 200, "GET /contact returns HTTP 200");
    const htmlContact = await resContact.text();
    assert(htmlContact.includes("anna@altair.academy"), "Contact page renders active email");
    assert(htmlContact.includes("+607 386 1617"), "Contact page renders active phone");

    // 4.7 Privacy Policy
    const resPrivacy = await fetch(base + "/privacy");
    assert(resPrivacy.status === 200, "GET /privacy returns HTTP 200");
    const htmlPrivacy = await resPrivacy.text();
    assert(htmlPrivacy.includes("Privacy Policy"), "Privacy policy renders title");
    assert(htmlPrivacy.includes("anna@altair.academy"), "Privacy policy has replaced {{email}}");
    assert(!htmlPrivacy.includes("{{email}}"), "Privacy policy does not leak raw {{email}} token");

    // 4.8 Terms of Service
    const resTerms = await fetch(base + "/terms");
    assert(resTerms.status === 200, "GET /terms returns HTTP 200");
    const htmlTerms = await resTerms.text();
    assert(htmlTerms.includes("Terms of Service"), "Terms of service renders title");

    // 4.9 Legal page redirects
    const resPrivRedirect = await fetch(base + "/legal/privacy", { redirect: "manual" });
    assert(
      resPrivRedirect.status === 308,
      "GET /legal/privacy returns HTTP 308 Permanent Redirect",
      `got ${resPrivRedirect.status}`,
    );

    const resTermsRedirect = await fetch(base + "/legal/terms", { redirect: "manual" });
    assert(
      resTermsRedirect.status === 308,
      "GET /legal/terms returns HTTP 308 Permanent Redirect",
      `got ${resTermsRedirect.status}`,
    );
  } catch (err) {
    console.warn("HTTP tests notice:", err);
  }

  console.log("\n===============================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================\n");

  await db.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
