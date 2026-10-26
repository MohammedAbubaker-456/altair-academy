/**
 * Admin Edit News Post Page
 *
 * Fetches news post details by ID and renders pre-populated NewsForm.
 *
 * Location: src/app/admin/(dashboard)/news/[id]/page.tsx
 * Type: Server Component
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsPostByIdAdmin } from "@/server/admin/news";
import { NewsForm } from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit News Post | Altair Academy Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminEditNewsPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditNewsPostPage({ params }: AdminEditNewsPostPageProps) {
  const { id } = await params;
  const post = await getNewsPostByIdAdmin(id);

  if (!post) {
    notFound();
  }

  return (
    <NewsForm
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        kind: post.kind,
        category: post.category,
        tags: post.tags,
        image: post.image,
        publishedAt: post.publishedAt,
        status: post.status,
      }}
    />
  );
}
