/**
 * Data Migration 0001: Initial Data Load
 *
 * Imports the baseline categories, courses, team members, news posts, and FAQs
 * into MongoDB and records execution in the MigrationLog table.
 *
 * Location: prisma/data-migrations/0001_initial_data.ts
 * Type: Data Migration Module
 */

import type { PrismaClient } from "@prisma/client";
import { seedCategories } from "../seed-data/categories";
import { seedCourses } from "../seed-data/courses";
import { seedTeamMembers } from "../seed-data/team";
import { seedNewsPosts } from "../seed-data/news";
import { seedFaqs } from "../seed-data/faqs";

export const name = "0001_initial_data";

export async function up(prisma: PrismaClient): Promise<void> {
  console.log(`Executing migration ${name}...`);

  // Categories
  const categoryMap = new Map<string, string>();
  for (const cat of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        short: cat.short,
        order: cat.order,
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

  // Courses
  for (const course of seedCourses) {
    const categoryId = categoryMap.get(course.categorySlug);
    if (!categoryId) continue;

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

  // Team
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

  // News
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

  // FAQs
  for (const faq of seedFaqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { answer: faq.answer, order: faq.order },
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

  console.log(`Migration ${name} finished successfully.`);
}
