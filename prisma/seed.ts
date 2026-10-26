/**
 * Database Seed Script (Safe & Idempotent)
 *
 * Populates MongoDB with initial datasets for categories, courses, team members,
 * news posts, FAQs, job openings, contact details, and legal pages.
 *
 * Seed Safety Rules:
 * - Insert-only: Matches records by slug / title / type+value and never overwrites existing records.
 * - Admin password safety: Creates the admin user ONLY if not present; never resets existing passwords.
 * - Requires ADMIN_EMAIL and ADMIN_PASSWORD (min 12 chars) from environment variables; fails fast if missing.
 * - News post bodies: Initialized from excerpts ONLY when body is empty.
 *
 * Run via: npm run db:seed
 * Location: prisma/seed.ts
 * Type: Seed CLI Script
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCategories } from "./seed-data/categories";
import { seedCourses } from "./seed-data/courses";
import { seedTeamMembers } from "./seed-data/team";
import { seedNewsPosts } from "./seed-data/news";
import { seedFaqs } from "./seed-data/faqs";
import { seedJobOpenings } from "./seed-data/careers";
import { seedContactDetails } from "./seed-data/contact";
import { seedLegalPages } from "./seed-data/legal";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Altair Academy database seed (Safe Insert-Only Mode)...");

  // 1. Bootstrap Admin User (Strict Environment Requirement)
  const adminEmail = process.env["ADMIN_EMAIL"]?.toLowerCase().trim();
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    console.error(
      "❌ Database seeding aborted: ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) must be set in your environment variables.",
    );
    process.exit(1);
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: "Altair Administrator",
        passwordHash,
      },
    });
    console.log(`✅ Admin account created: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin account already exists (preserving password): ${existingAdmin.email}`);
  }

  // 2. Categories (Insert-Only by Slug)
  const categoryMap = new Map<string, string>();
  for (const cat of seedCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (existing) {
      categoryMap.set(cat.slug, existing.id);
    } else {
      const record = await prisma.category.create({
        data: {
          slug: cat.slug,
          name: cat.name,
          short: cat.short,
          order: cat.order,
          status: "ACTIVE",
        },
      });
      categoryMap.set(cat.slug, record.id);
    }
  }
  console.log(`✅ Checked ${seedCategories.length} categories`);

  // 3. Courses (Insert-Only by Slug)
  let newCourses = 0;
  for (const course of seedCourses) {
    const categoryId = categoryMap.get(course.categorySlug);
    if (!categoryId) {
      console.warn(
        `⚠️ Warning: Category ${course.categorySlug} not found for course ${course.slug}`,
      );
      continue;
    }

    const existing = await prisma.course.findUnique({
      where: { slug: course.slug },
    });

    if (!existing) {
      await prisma.course.create({
        data: {
          slug: course.slug,
          title: course.title,
          image: course.image,
          categoryId,
          level: course.level,
          duration: course.duration,
          price: course.price,
          summary: course.summary,
          isFeatured: course.isFeatured,
          order: course.order,
          status: "ACTIVE",
        },
      });
      newCourses++;
    }
  }
  console.log(`✅ Checked ${seedCourses.length} courses (${newCourses} created)`);

  // 4. Team Members & Instructors (Insert-Only by Slug)
  let newTeam = 0;
  for (const member of seedTeamMembers) {
    const existing = await prisma.teamMember.findUnique({
      where: { slug: member.slug },
    });

    if (!existing) {
      await prisma.teamMember.create({
        data: {
          slug: member.slug,
          name: member.name,
          instructorName: member.instructorName,
          role: member.role,
          instructorRole: member.instructorRole,
          shortBio: member.shortBio,
          fullBio: member.fullBio,
          expertise: member.expertise,
          image: member.image,
          placements: [...member.placements],
          managementOrder: member.managementOrder,
          instructorOrder: member.instructorOrder,
          status: "ACTIVE",
        },
      });
      newTeam++;
    }
  }
  console.log(`✅ Checked ${seedTeamMembers.length} team members (${newTeam} created)`);

  // 5. News Posts (Insert-Only by Slug; fill empty body with excerpt)
  let newNews = 0;
  let updatedBodies = 0;
  for (const post of seedNewsPosts) {
    const existing = await prisma.newsPost.findUnique({
      where: { slug: post.slug },
    });

    if (!existing) {
      await prisma.newsPost.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          body: post.excerpt, // Default body initialized from excerpt
          kind: post.kind,
          category: post.category,
          tags: post.tags,
          image: post.image,
          publishedAt: post.publishedAt,
          status: "ACTIVE",
        },
      });
      newNews++;
    } else if (!existing.body) {
      await prisma.newsPost.update({
        where: { id: existing.id },
        data: { body: existing.excerpt },
      });
      updatedBodies++;
    }
  }
  console.log(
    `✅ Checked ${seedNewsPosts.length} news posts (${newNews} created, ${updatedBodies} empty bodies initialized). Real article text should be authored in the admin dashboard.`,
  );

  // 6. FAQs (Insert-Only by Question)
  let newFaqs = 0;
  for (const faq of seedFaqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });

    if (!existing) {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          status: "ACTIVE",
        },
      });
      newFaqs++;
    }
  }
  console.log(`✅ Checked ${seedFaqs.length} FAQs (${newFaqs} created)`);

  // 7. Job Openings (Insert-Only by Title)
  let newJobs = 0;
  for (const job of seedJobOpenings) {
    const existing = await prisma.jobOpening.findFirst({
      where: { title: job.title },
    });

    if (!existing) {
      await prisma.jobOpening.create({
        data: {
          title: job.title,
          employmentType: job.employmentType,
          location: job.location,
          scope: job.scope,
          summary: job.summary,
          order: job.order,
          status: "ACTIVE",
        },
      });
      newJobs++;
    }
  }
  console.log(`✅ Checked ${seedJobOpenings.length} job openings (${newJobs} created)`);

  // 8. Contact Details (Insert-Only by Type + Value)
  let newContacts = 0;
  for (const contact of seedContactDetails) {
    const existing = await prisma.contactDetail.findFirst({
      where: {
        type: contact.type,
        value: contact.value,
      },
    });

    if (!existing) {
      await prisma.contactDetail.create({
        data: {
          type: contact.type,
          label: contact.label,
          value: contact.value,
          link: contact.link,
          order: contact.order,
          status: "ACTIVE",
        },
      });
      newContacts++;
    }
  }
  console.log(`✅ Checked ${seedContactDetails.length} contact details (${newContacts} created)`);

  // 9. Legal Pages (Insert-Only by Slug)
  let newLegal = 0;
  for (const legal of seedLegalPages) {
    const existing = await prisma.legalPage.findUnique({
      where: { slug: legal.slug },
    });

    if (!existing) {
      await prisma.legalPage.create({
        data: {
          slug: legal.slug,
          title: legal.title,
          metaDescription: legal.metaDescription,
          body: legal.body,
          showInFooter: legal.showInFooter,
          isCore: legal.isCore,
          order: legal.order,
          status: "ACTIVE",
        },
      });
      newLegal++;
    }
  }
  console.log(`✅ Checked ${seedLegalPages.length} legal pages (${newLegal} created)`);

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
