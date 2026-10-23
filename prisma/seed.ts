/**
 * Database Seed Script
 *
 * Idempotently populates the MongoDB database with initial categories, courses,
 * team members, news posts, FAQs, and bootstraps the default administrator account.
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

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Altair Academy database seed...");

  // 1. Bootstrap Admin User
  const adminEmail = (process.env["ADMIN_EMAIL"] ?? "admin@altair.academy").toLowerCase().trim();
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "AltairAdmin2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Altair Administrator",
    },
    create: {
      email: adminEmail,
      name: "Altair Administrator",
      passwordHash,
    },
  });
  console.log(`✅ Admin account ensured: ${admin.email}`);

  // 2. Categories
  const categoryMap = new Map<string, string>();
  for (const cat of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        short: cat.short,
        order: cat.order,
        status: "ACTIVE",
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        short: cat.short,
        order: cat.order,
        status: "ACTIVE",
      },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ Seeded ${seedCategories.length} categories`);

  // 3. Courses
  for (const course of seedCourses) {
    const categoryId = categoryMap.get(course.categorySlug);
    if (!categoryId) {
      console.warn(
        `⚠️ Warning: Category ${course.categorySlug} not found for course ${course.slug}`,
      );
      continue;
    }

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
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
      create: {
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
  }
  console.log(`✅ Seeded ${seedCourses.length} courses`);

  // 4. Team Members & Instructors
  for (const member of seedTeamMembers) {
    await prisma.teamMember.upsert({
      where: { slug: member.slug },
      update: {
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
      create: {
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
  }
  console.log(`✅ Seeded ${seedTeamMembers.length} team members / instructors`);

  // 5. News Posts
  for (const post of seedNewsPosts) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        kind: post.kind,
        category: post.category,
        tags: post.tags,
        image: post.image,
        publishedAt: post.publishedAt,
        status: "ACTIVE",
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        kind: post.kind,
        category: post.category,
        tags: post.tags,
        image: post.image,
        publishedAt: post.publishedAt,
        status: "ACTIVE",
      },
    });
  }
  console.log(`✅ Seeded ${seedNewsPosts.length} news posts`);

  // 6. FAQs
  for (const faq of seedFaqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          order: faq.order,
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          status: "ACTIVE",
        },
      });
    }
  }
  console.log(`✅ Seeded ${seedFaqs.length} FAQs`);

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
